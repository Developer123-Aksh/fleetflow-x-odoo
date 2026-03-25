import pandas as pd

def create_labels(file_path, future_days=1):
    df = pd.read_csv(file_path)

    print("\n📊 Creating Labels...")

    # ==========================
    # 📊 FUTURE PRICE
    # ==========================
    df["Future_Close"] = df["Close"].shift(-future_days)

    # ==========================
    # 📈 RETURN
    # ==========================
    df["Return"] = (df["Future_Close"] - df["Close"]) / df["Close"]

    # ==========================
    # 🎯 LABEL (3-class)
    # ==========================
    def label_func(x):
        if x > 0.02:        # smaller threshold (better for daily)
            return "Bullish"
        elif x < -0.02:
            return "Bearish"
        else:
            return "Neutral"

    df["Label"] = df["Return"].apply(label_func)

    # ==========================
    # 🤖 TARGET (FOR MODEL)
    # ==========================
    df["target"] = df["Label"].apply(lambda x: 1 if x == "Bullish" else 0)

    # ==========================
    # CLEAN DATA
    # ==========================
    df = df.dropna().reset_index(drop=True)

    # ==========================
    # SAVE FILE
    # ==========================
    output_path = file_path.replace(".csv", "_labeled.csv")
    df.to_csv(output_path, index=False)

    print(f"\n✅ Labeled data saved to {output_path}")

    # ==========================
    # 📊 DEBUG INFO
    # ==========================
    print("\n📊 Label Distribution:")
    print(df["Label"].value_counts())

    print("\n🎯 Target Distribution:")
    print(df["target"].value_counts())

    return df


if __name__ == "__main__":
    file_path = "data/RELIANCE.NS_features.csv"
    df = create_labels(file_path)

    print("\nSample Data:")
    print(df.head())