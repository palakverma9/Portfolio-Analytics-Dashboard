import yfinance as yf
import pandas as pd
import os
import time

# The 5 core global ETFs selected for the equal-weighted portfolio
TICKERS = {
    "VOO": "Vanguard S&P 500 ETF",
    "QQQ": "Invesco Nasdaq 100",
    "VEA": "Vanguard Developed Markets ETF",
    "VWO": "Vanguard Emerging Markets ETF",
    "GLD": "SPDR Gold Trust",
}

# Define folder path to save stock price files locally
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
MAX_AGE_SECONDS = 24 * 60 * 60  # Cache age limit = 24 hours


def _csv_path(ticker: str) -> str:
    # Returns the file path for a ticker's cached CSV file
    return os.path.join(DATA_DIR, f"{ticker}.csv")


def _is_stale(filepath: str) -> bool:
    # Checks if the file doesn't exist, or if it is older than 24 hours
    if not os.path.exists(filepath):
        return True
    age = time.time() - os.path.getmtime(filepath)
    return age > MAX_AGE_SECONDS


def fetch_all():
    # Downloads 5-year stock data for all tickers and saves them locally
    os.makedirs(DATA_DIR, exist_ok=True)

    for ticker in TICKERS:
        path = _csv_path(ticker)
        # Skip download if we already have a fresh file to save bandwidth
        if not _is_stale(path):
            print(f"[data_service] {ticker} CSV is fresh, skipping download")
            continue

        print(f"[data_service] Downloading {ticker} from Yahoo Finance...")
        try:
            # Download 5 years of daily data
            df = yf.download(ticker, period="5y", interval="1d", progress=False)
        except Exception as e:
            raise RuntimeError(f"Failed to download {ticker} from Yahoo Finance: {e}")

        if df is None or df.empty:
            raise RuntimeError(f"No data returned for {ticker}.")

        # Handle MultiIndex columns returned by newer yfinance versions (keeps simple column names)
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)

        # Save to local CSV file
        df.to_csv(path)
        print(f"[data_service] Saved {ticker} -> {path} ({len(df)} rows)")

    print("[data_service] All tickers downloaded.")


def get_ohlc(ticker: str) -> pd.DataFrame:
    # Reads the local CSV file and returns it as a Pandas DataFrame
    ticker = ticker.upper()
    if ticker not in TICKERS:
        raise ValueError(f"Unknown ticker: {ticker}")

    path = _csv_path(ticker)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Data for {ticker} not found. Run fetch_all() first.")

    df = pd.read_csv(path, index_col=0, parse_dates=True)
    df.index.name = "Date"
    return df


def is_data_ready() -> bool:
    # Returns True if CSV files for all 5 tickers exist locally
    for ticker in TICKERS:
        if not os.path.exists(_csv_path(ticker)):
            return False
    return True
