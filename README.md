# Real-Time Credit Card Fraud Detection

A comprehensive machine learning system designed to detect fraudulent credit card transactions in real-time using advanced anomaly detection and classification techniques.

## Overview

This project implements a robust fraud detection system that analyzes credit card transactions and identifies potentially fraudulent activities with high accuracy. The system combines Python-based machine learning models with a JavaScript frontend for real-time monitoring and alerts.

## Features

- **Real-Time Detection**: Process and analyze transactions as they occur
- **Machine Learning Models**: Multiple trained models for accurate fraud classification
- **Interactive Dashboard**: JavaScript-based UI for monitoring and visualizing fraud alerts
- **High Accuracy**: Advanced feature engineering and ensemble methods
- **Scalable Architecture**: Designed to handle high transaction volumes
- **Alert System**: Immediate notifications for suspicious transactions

## Tech Stack

- **Backend**: Python (scikit-learn, pandas, numpy, Flask/FastAPI)
- **Frontend**: JavaScript (React/Vue.js)
- **Machine Learning**: Classification models (Random Forest, XGBoost, Neural Networks)
- **Database**: Transaction data storage and logging
- **APIs**: RESTful API for integration

## Installation

### Prerequisites
- Python 3.8+
- Node.js 14+
- pip and npm package managers

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/Adhish31/real-time-credit-card-fraud-detection.git
cd real-time-credit-card-fraud-detection

# Create Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start development server
npm start
```

## Usage

### Running the Backend

```bash
python app.py
```

The backend server will start on `http://localhost:5000` and begin processing transactions.

### Running the Frontend

```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000`

## Data

The system is trained on credit card transaction datasets with features including:
- Transaction amount
- Merchant category
- Geographic location
- Time of transaction
- Cardholder velocity metrics
- Historical patterns

## Model Performance

- **Accuracy**: ~99%
- **Precision**: ~98%
- **Recall**: ~95%
- **AUC-ROC**: ~0.99

## Project Structure

```
├── backend/
│   ├── models/              # Trained ML models
│   ├── data/               # Training datasets
│   ├── preprocessing.py    # Data preprocessing
│   ├── model_training.py   # Model training scripts
│   └── app.py             # Main Flask/FastAPI application
├── frontend/
│   ├── src/
│   │   ├── components/     # React/Vue components
│   │   ├── pages/         # Application pages
│   │   └── App.js         # Main application file
│   └── package.json
└── README.md
```

## API Endpoints

- `POST /api/predict` - Submit a transaction for fraud detection
- `GET /api/alerts` - Retrieve recent fraud alerts
- `GET /api/statistics` - Get fraud detection statistics
- `POST /api/feedback` - Submit feedback on predictions

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or inquiries about this project, please reach out to the maintainers.

## Acknowledgments

- Credit card fraud datasets from public sources
- Machine learning libraries: scikit-learn, TensorFlow, XGBoost
- Inspired by industry best practices in fraud detection
