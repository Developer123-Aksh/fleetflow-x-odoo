import numpy as np
import pandas as pd

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, BatchNormalization
from tensorflow.keras.callbacks import EarlyStopping

from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report


# ==========================
# 📊 DATA PREPARATION
# ==========================
def prepare_lstm_data_no_leakage(file_path, window_size=60):
    df = pd.read_csv(file_path)

    print("\n📊 Original Columns:", df.columns.tolist())

    # ==========================
    # 🔥 REMOVE UNWANTED COLUMNS
    # ==========================
    drop_cols = ["Date", "Label", "Future_Close", "Return"]
    df = df.drop(columns=drop_cols, errors="ignore")

    # Drop NaN safely
    df = df.dropna().reset_index(drop=True)

    # ==========================
    # CHECK TARGET
    # ==========================
    if "target" not in df.columns:
        raise ValueError("❌ 'target' column missing!")

    # ==========================
    # FEATURES + TARGET
    # ==========================
    features = df.drop(columns=["target"], errors="ignore")

    # Keep only numeric columns (safety)
    features = features.select_dtypes(include=[np.number])

    target = df["target"].values

    X = features.values
    y = target

    # ==========================
    # 🔁 CREATE SEQUENCES
    # ==========================
    X_seq, y_seq = [], []
    for i in range(window_size, len(X)):
        X_seq.append(X[i - window_size:i])
        y_seq.append(y[i])

    X_seq = np.array(X_seq)
    y_seq = np.array(y_seq)

    print("📊 Total sequences created:", len(X_seq))

    if len(X_seq) == 0:
        raise ValueError("❌ No data left! Reduce window_size or fix data")

    # ==========================
    # 📊 TIME SPLIT
    # ==========================
    split = int(len(X_seq) * 0.8)

    X_train, X_test = X_seq[:split], X_seq[split:]
    y_train, y_test = y_seq[:split], y_seq[split:]

    # ==========================
    # 📏 SCALING
    # ==========================
    scaler = MinMaxScaler()

    X_train = scaler.fit_transform(
        X_train.reshape(-1, X_train.shape[-1])
    ).reshape(X_train.shape)

    X_test = scaler.transform(
        X_test.reshape(-1, X_test.shape[-1])
    ).reshape(X_test.shape)

    return X_train, X_test, y_train, y_test, df


# ==========================
# 🤖 TRAIN MODEL
# ==========================
def train_model(labeled_file):
    X_train, X_test, y_train, y_test, df = prepare_lstm_data_no_leakage(labeled_file)

    print("\n📊 Training Data Shape:", X_train.shape)

    model = Sequential()

    model.add(LSTM(64, return_sequences=True, input_shape=(X_train.shape[1], X_train.shape[2])))
    model.add(Dropout(0.3))
    model.add(BatchNormalization())

    model.add(LSTM(64, return_sequences=True))
    model.add(Dropout(0.3))
    model.add(BatchNormalization())

    model.add(LSTM(32))
    model.add(Dropout(0.3))

    model.add(Dense(16, activation='relu'))
    model.add(Dense(1, activation='sigmoid'))

    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy']
    )

    model.summary()

    # ==========================
    # TRAINING
    # ==========================
    early_stop = EarlyStopping(
        monitor='val_loss',
        patience=5,
        restore_best_weights=True
    )

    model.fit(
        X_train,
        y_train,
        epochs=30,
        batch_size=32,
        validation_split=0.2,
        callbacks=[early_stop],
        verbose=1
    )

    # ==========================
    # 📊 EVALUATION
    # ==========================
    print("\n📊 Evaluating Model...")

    y_pred_prob = model.predict(X_test)
    y_pred = (y_pred_prob > 0.5).astype(int)

    acc = accuracy_score(y_test, y_pred)
    print("\n✅ Accuracy:", round(acc * 100, 2), "%")

    cm = confusion_matrix(y_test, y_pred)
    print("\n📌 Confusion Matrix:\n", cm)

    print("\n📊 Classification Report:\n", classification_report(y_test, y_pred))

    # ==========================
    # 💰 BACKTESTING
    # ==========================
    print("\n💰 Running Backtest...")

    prices = df["Close"].values
    prices = prices[-len(y_test):]

    returns = []

    for i in range(len(y_pred)):
        if y_pred[i] == 1:
            if i + 1 < len(prices):
                ret = (prices[i + 1] - prices[i]) / prices[i]
                returns.append(ret)
        else:
            returns.append(0)

    returns = np.array(returns)

    cumulative_return = np.cumprod(1 + returns)
    total_return = (cumulative_return[-1] - 1) * 100

    print("\n📈 Total Return:", round(total_return, 2), "%")

    if np.std(returns) != 0:
        sharpe = np.mean(returns) / np.std(returns)
        print("📊 Sharpe Ratio:", round(sharpe, 3))
    else:
        print("📊 Sharpe Ratio: 0")

    wins = np.sum(returns > 0)
    total_trades = np.sum(y_pred == 1)

    if total_trades > 0:
        win_rate = wins / total_trades
        print("🏆 Win Rate:", round(win_rate * 100, 2), "%")
    else:
        print("🏆 Win Rate: No trades")

    print("\n===== MODEL + BACKTEST COMPLETE =====\n")

    return model