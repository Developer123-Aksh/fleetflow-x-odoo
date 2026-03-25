import pandas as pd
import os

def add_indicators(file_path):
    
    df = pd.read_csv(file_path)

    # Convert numeric columns properly
    numeric_cols = ["Open", "High", "Low", "Close", "Volume"]

    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # Drop non-numeric junk rows
    df.dropna(inplace=True)

    # Moving Averages
    df["MA20"] = df["Close"].rolling(window=20).mean()
    df["MA50"] = df["Close"].rolling(window=50).mean()

    # Exponential Moving Average
    df["EMA12"] = df["Close"].ewm(span=12, adjust=False).mean()
    df["EMA26"] = df["Close"].ewm(span=26, adjust=False).mean()

    # MACD
    df["MACD"] = df["EMA12"] - df["EMA26"]

    # RSI
    delta = df["Close"].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()

    rs = gain / loss
    df["RSI"] = 100 - (100 / (1 + rs))

    # Bollinger Bands
    df["BB_Middle"] = df["Close"].rolling(window=20).mean()
    df["BB_Upper"] = df["BB_Middle"] + (df["Close"].rolling(window=20).std() * 2)
    df["BB_Lower"] = df["BB_Middle"] - (df["Close"].rolling(window=20).std() * 2)

    # Returns
    df["Daily_Return"] = df["Close"].pct_change()

    # Drop NaN values
    df.dropna(inplace=True)

    # Save file
    output_path = file_path.replace(".csv", "_features.csv")
    df.to_csv(output_path, index=False)

    print(f"Features saved to {output_path}")

    return df


if __name__ == "__main__":
    file_path = "data/RELIANCE.NS.csv"
    df = add_indicators(file_path)
    print(df.head())