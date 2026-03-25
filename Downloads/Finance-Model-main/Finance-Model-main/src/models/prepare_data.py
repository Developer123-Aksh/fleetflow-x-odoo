import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split


def prepare_lstm_data(file_path, window_size=30):

    df = pd.read_csv(file_path)

    # Encode labels
    label_map = {"Bullish": 2, "Neutral": 1, "Bearish": 0}
    df["Label"] = df["Label"].map(label_map)

    # Drop unnecessary columns
    df.drop(columns=["Date", "Future_Close", "Return"], inplace=True)

    # Features & labels
    X = df.drop("Label", axis=1)
    y = df["Label"]

    # Scale features
    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X)

    # Create sequences
    X_seq = []
    y_seq = []

    for i in range(window_size, len(X_scaled)):
        X_seq.append(X_scaled[i-window_size:i])
        y_seq.append(y.iloc[i])

    X_seq = np.array(X_seq)
    y_seq = np.array(y_seq)

    # Train-test split (important: NO shuffle)
    split = int(0.8 * len(X_seq))

    X_train = X_seq[:split]
    X_test = X_seq[split:]

    y_train = y_seq[:split]
    y_test = y_seq[split:]

    print("Data Prepared:")
    print("X_train shape:", X_train.shape)
    print("X_test shape:", X_test.shape)

    return X_train, X_test, y_train, y_test


if __name__ == "__main__":
    file_path = "data/RELIANCE.NS_features_labeled.csv"
    X_train, X_test, y_train, y_test = prepare_lstm_data(file_path)