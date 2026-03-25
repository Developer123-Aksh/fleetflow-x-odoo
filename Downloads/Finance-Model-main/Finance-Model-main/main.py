import argparse

from src.data_collection.fetch_data import fetch_stock_data
from src.feature_engineering.add_indicators import add_indicators
from src.feature_engineering.create_labels import create_labels
from src.models.train_lstm import train_model


def run_pipeline(ticker="RELIANCE.NS", train=False):
    print("\n===== STOCK PREDICTION PIPELINE STARTED =====\n")

    # ==========================
    # 📊 STEP 1: FETCH DATA
    # ==========================
    print("📥 Step 1: Fetching Stock Data...")
    fetch_stock_data(ticker=ticker)

    raw_file = f"data/{ticker}.csv"

    # ==========================
    # 📈 STEP 2: ADD INDICATORS
    # ==========================
    print("\n📊 Step 2: Adding Technical Indicators...")
    add_indicators(raw_file)

    feature_file = raw_file.replace(".csv", "_features.csv")

    # ==========================
    # 🎯 STEP 3: CREATE LABELS
    # ==========================
    print("\n🎯 Step 3: Creating Labels...")
    create_labels(feature_file)

    labeled_file = feature_file.replace("_features.csv", "_features_labeled.csv")

    # ==========================
    # 🤖 STEP 4: TRAIN MODEL
    # ==========================
    if train:
        print("\n🤖 Step 4: Training LSTM Model...")
        train_model(labeled_file)
    else:
        print("\n⚠️ Skipping training (use --train flag to enable)")

    print("\n===== PIPELINE COMPLETED =====\n")


# ==========================
# 🚀 MAIN ENTRY POINT
# ==========================
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Stock Prediction Pipeline")

    parser.add_argument(
        "--ticker",
        type=str,
        default="RELIANCE.NS",
        help="Stock ticker (e.g., RELIANCE.NS, AAPL)"
    )

    parser.add_argument(
        "--train",
        action="store_true",
        help="Train LSTM model after preprocessing"
    )

    args = parser.parse_args()

    run_pipeline(ticker=args.ticker, train=args.train)