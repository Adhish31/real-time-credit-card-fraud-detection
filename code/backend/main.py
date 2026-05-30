from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
import time
import uuid
import numpy as np
import asyncio
import os
from pathlib import Path

from motor.motor_asyncio import AsyncIOMotorClient

ROOT = Path(__file__).resolve().parent.parent
LSTM_PATH = ROOT / "lstm_model.keras"
GRU_PATH = ROOT / "gru_model.keras"
FRAUD_THRESHOLD = 0.3
SEQUENCE_LENGTH = 20
MAX_AMOUNT = 5000.0
CATEGORY_NAMES = ["Retail", "Travel", "Gaming", "Crypto", "Utilities"]

app = FastAPI(title="FraudGuard DL Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_TIMEOUT_MS = int(os.getenv("MONGO_TIMEOUT_MS", "3000"))
client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=MONGO_TIMEOUT_MS)
db = client.fraudguard
transactions_collection = db.transactions
predictions_collection = db.predictions

# In-memory fallback when MongoDB is unavailable (dev / no install)
_local_transactions: list[dict] = []
_local_predictions: list[dict] = []

# --- TensorFlow (optional) ---
TF_AVAILABLE = False
models: dict = {}

try:
    import tensorflow as tf
    from tensorflow.keras.models import load_model

    TF_AVAILABLE = True

    def _load_keras(path: Path, name: str):
        if path.exists():
            models[name] = load_model(str(path))
            print(f"Loaded {name.upper()} from {path}")
        else:
            print(f"Warning: {path.name} not found — {name} will use mock inference")

    _load_keras(LSTM_PATH, "lstm")
    _load_keras(GRU_PATH, "gru")
except ImportError:
    print("TensorFlow not installed. Using mock models. Install with: pip install tensorflow")


class MockModel:
    """Heuristic fallback when .keras files or TensorFlow are unavailable."""

    def predict(self, x, verbose=0):
        seq = x[0]
        amounts = seq[:, 0]
        cats = seq[:, 1]
        avg_amt = float(np.mean(amounts))
        max_amt = float(np.max(amounts))
        crypto_ratio = float(np.mean(cats >= 3))
        score = min(0.95, 0.15 + avg_amt * 0.4 + max_amt * 0.3 + crypto_ratio * 0.25)
        return np.array([[score]], dtype=np.float32)

    def fit(self, x, y, epochs=1, batch_size=1, verbose=0):
        return None


if "lstm" not in models:
    models["lstm"] = MockModel()
if "gru" not in models:
    models["gru"] = MockModel()


class TransactionItem(BaseModel):
    amount: float = Field(..., gt=0)
    category: int = Field(..., ge=0, le=4)


class PredictionRequest(BaseModel):
    transactions: List[TransactionItem]
    model_type: Literal["lstm", "gru"] = "lstm"
    fine_tune: bool = True
    fraud_label: Optional[int] = Field(None, ge=0, le=1)


class Preprocessor:
    @staticmethod
    def process_sequence(transactions: List[TransactionItem]) -> np.ndarray:
        rows = []
        for t in transactions:
            scaled = min(1.0, max(0.0, t.amount / MAX_AMOUNT))
            rows.append([scaled, float(t.category)])
        arr = np.array(rows, dtype=np.float32).reshape(1, SEQUENCE_LENGTH, 2)
        return arr


def get_status(probability: float, threshold: float = FRAUD_THRESHOLD) -> str:
    return "FRAUD" if probability > threshold else "LEGIT"


async def _db_op(coro, timeout: float = 5.0):
    return await asyncio.wait_for(coro, timeout=timeout)


def _build_history_records(
    transactions: List[TransactionItem],
    prediction_id: str,
    probability: float,
    status: str,
    model_used: str,
    ts: float,
) -> tuple[dict, dict]:
    """One summary row for History UI + prediction metadata."""
    avg_amount = round(sum(t.amount for t in transactions) / len(transactions), 2)
    last_category = transactions[-1].category
    txn_doc = {
        "id": f"PRED-{prediction_id[:8].upper()}",
        "amount": avg_amount,
        "category": last_category,
        "status": status,
        "risk_score": probability,
        "prediction_id": prediction_id,
        "model_used": model_used,
        "sequence_size": len(transactions),
        "timestamp": ts,
    }
    pred_doc = {
        "prediction_id": prediction_id,
        "probability": probability,
        "status": status,
        "model_used": model_used,
        "timestamp": ts,
    }
    return txn_doc, pred_doc


async def save_prediction_to_db(
    transactions: List[TransactionItem],
    prediction_id: str,
    probability: float,
    status: str,
    model_used: str,
) -> bool:
    ts = time.time()
    txn_doc, pred_doc = _build_history_records(
        transactions, prediction_id, probability, status, model_used, ts
    )

    try:
        await _db_op(transactions_collection.insert_one(txn_doc))
        await _db_op(predictions_collection.insert_one(pred_doc))
        return True
    except (asyncio.TimeoutError, Exception) as e:
        print(f"DB save error (using in-memory store): {e}")
        _local_transactions.insert(0, txn_doc)
        _local_predictions.insert(0, pred_doc)
        if len(_local_transactions) > 500:
            _local_transactions.pop()
        if len(_local_predictions) > 500:
            _local_predictions.pop()
        return False


def fine_tune_model(model_type: str, sequence_arr: np.ndarray, label: int):
    model = models.get(model_type)
    if model is None or isinstance(model, MockModel):
        return
    try:
        model.fit(sequence_arr, np.array([[label]], dtype=np.float32), epochs=1, batch_size=1, verbose=0)
    except Exception as e:
        print(f"Fine-tune error: {e}")


@app.get("/")
async def root():
    return {
        "service": "FraudGuard",
        "tensorflow": TF_AVAILABLE,
        "models": {
            "lstm": LSTM_PATH.exists() or not TF_AVAILABLE,
            "gru": GRU_PATH.exists() or not TF_AVAILABLE,
        },
    }


@app.post("/api/predict-train")
async def predict_and_train(req: PredictionRequest, bg_tasks: BackgroundTasks):
    if len(req.transactions) != SEQUENCE_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Exactly {SEQUENCE_LENGTH} transactions required, got {len(req.transactions)}",
        )

    model = models.get(req.model_type)
    if model is None:
        raise HTTPException(status_code=400, detail=f"Unknown model_type: {req.model_type}")

    sequence_arr = Preprocessor.process_sequence(req.transactions)

    loop = asyncio.get_event_loop()
    prob = await loop.run_in_executor(None, lambda: float(model.predict(sequence_arr, verbose=0)[0][0]))
    status = get_status(prob)
    prediction_id = str(uuid.uuid4())

    if req.fine_tune and TF_AVAILABLE and not isinstance(model, MockModel):
        label = req.fraud_label if req.fraud_label is not None else (1 if status == "FRAUD" else 0)
        bg_tasks.add_task(fine_tune_model, req.model_type, sequence_arr, label)

    # Save before response so History always has the new prediction
    await save_prediction_to_db(
        req.transactions,
        prediction_id,
        prob,
        status,
        req.model_type,
    )

    return {
        "prediction_id": prediction_id,
        "probability": round(prob, 4),
        "status": status,
        "risk_score": round(prob, 4),
        "model_used": req.model_type,
    }


def _serialize_txn(doc: dict) -> dict:
    out = dict(doc)
    if "_id" in out:
        out["_id"] = str(out["_id"])
    return out


async def _get_all_transactions(limit: int = 1000) -> list[dict]:
    """Merge MongoDB + in-memory history (same source as History page)."""
    limit = min(max(1, limit), 5000)
    results: list[dict] = []
    seen_ids: set[str] = set()

    try:
        cursor = transactions_collection.find().sort("timestamp", -1).limit(limit)

        async def _collect():
            items = []
            async for doc in cursor:
                items.append(_serialize_txn(doc))
            return items

        results = await _db_op(_collect())
        seen_ids = {r.get("id") for r in results if r.get("id")}
    except (asyncio.TimeoutError, Exception) as e:
        print(f"Transactions DB error: {e}")

    for doc in _local_transactions:
        if doc.get("id") not in seen_ids:
            results.append(_serialize_txn(doc))
            seen_ids.add(doc.get("id"))

    results.sort(key=lambda x: x.get("timestamp", 0), reverse=True)
    return results[:limit]


def _build_analytics_from_transactions(txns: list[dict]) -> dict:
    total = len(txns)
    fraud_count = sum(1 for t in txns if t.get("status") == "FRAUD")
    legit_count = total - fraud_count
    legit_rate = f"{((legit_count / total) * 100):.1f}%" if total > 0 else "—"

    pie_chart = [
        {"name": "Legit", "value": legit_count},
        {"name": "Fraud", "value": fraud_count},
    ]

    now = time.time()
    line_chart = []
    for h in range(5, -1, -1):
        start = now - (h + 1) * 3600
        end = now - h * 3600
        bucket = [t for t in txns if start <= float(t.get("timestamp", 0)) < end]
        f_cnt = sum(1 for t in bucket if t.get("status") == "FRAUD")
        l_cnt = sum(1 for t in bucket if t.get("status") == "LEGIT")
        hour_label = time.strftime("%H:00", time.localtime(end))
        line_chart.append({"time": hour_label, "fraud": f_cnt, "legit": l_cnt})

    bar_chart = []
    for cat_id, cat_name in enumerate(CATEGORY_NAMES):
        cnt = sum(
            1
            for t in txns
            if t.get("status") == "FRAUD" and int(t.get("category", -1)) == cat_id
        )
        bar_chart.append({"category": cat_name, "fraud": cnt})

    return {
        "stats": [
            {"title": "Total Transactions", "value": str(total), "change": "+0%", "isPositive": True},
            {"title": "Fraud Detected", "value": str(fraud_count), "change": "+0%", "isPositive": False},
            {"title": "Legitimate", "value": str(legit_count), "change": "+0%", "isPositive": True},
            {"title": "Legit Rate", "value": legit_rate, "change": "—", "isPositive": True},
        ],
        "pieChart": pie_chart,
        "lineChart": line_chart,
        "barChart": bar_chart,
    }


@app.get("/api/transactions")
async def get_transactions(limit: int = 50):
    return await _get_all_transactions(limit)

@app.get("/api/analytics")
async def get_analytics():
    try:
        txns = await _get_all_transactions(limit=5000)
        return _build_analytics_from_transactions(txns)
    except Exception as e:
        print(f"Analytics error: {e}")
        return _build_analytics_from_transactions(_local_transactions)
