import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report, confusion_matrix, ConfusionMatrixDisplay

from src.models.prepare_data import prepare_lstm_data
from src.models.train_lstm import train_model


def evaluate(file_path):

    # Load data
    X_train, X_test, y_train, y_test = prepare_lstm_data(file_path)

    # Train model
    model, history = train_model(file_path)

    # Predictions
    y_pred_probs = model.predict(X_test)
    y_pred = np.argmax(y_pred_probs, axis=1)

    # True labels
    y_true = y_test

    print("\n📊 Classification Report:\n")
    print(classification_report(y_true, y_pred))

    # Confusion Matrix
    cm = confusion_matrix(y_true, y_pred)
    disp = ConfusionMatrixDisplay(confusion_matrix=cm,
                                  display_labels=["Bearish", "Neutral", "Bullish"])

    disp.plot()
    plt.title("Confusion Matrix")
    plt.show()


if __name__ == "__main__":
    file_path = "data/RELIANCE.NS_features_labeled.csv"
    evaluate(file_path)