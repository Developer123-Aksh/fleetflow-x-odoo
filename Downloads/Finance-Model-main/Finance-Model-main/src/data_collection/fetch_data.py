import yfinance as yf
import pandas as pd
import os

def fetch_stock_data(ticker="RELIANCE.NS", start="2015-01-01", end="2024-01-01"):
    
    print(f"Fetching data for {ticker}...")
    
    data = yf.download(ticker, start=start, end=end)

    # Create data folder if not exists
    os.makedirs("data", exist_ok=True)

    file_path = f"data/{ticker}.csv"
    data_to_save = data.reset_index()
    if isinstance(data_to_save.columns, pd.MultiIndex):
        data_to_save.columns = data_to_save.columns.get_level_values(0)
    if "Date" not in data_to_save.columns and "index" in data_to_save.columns:
        data_to_save.rename(columns={"index": "Date"}, inplace=True)

    data_to_save = data_to_save[["Date", "Open", "High", "Low", "Close", "Volume"]]
    data_to_save.to_csv(file_path, index=False)

    print(f"Data saved to {file_path}")
    
    return data


if __name__ == "__main__":
    df = fetch_stock_data()
    print(df.head())