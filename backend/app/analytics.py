import pandas as pd
import numpy as np
from app.data_service import TICKERS, get_ohlc

COLORS = ["#2563eb", "#0d9488", "#7c3aed", "#ea580c", "#d97706"]
RISK_FREE_RATE = 0.04  # Annualized risk-free rate (4%) used for Sharpe ratio calculation
TRADING_DAYS = 252  # Standard number of stock market trading days in a year


def _get_all_close() -> pd.DataFrame:
    # Combines closing prices of all 5 ETFs into a single Pandas DataFrame
    frames = {}
    for ticker in TICKERS:
        df = get_ohlc(ticker)
        frames[ticker] = df["Close"]
    # Drop any row with missing data to keep the database aligned
    combined = pd.DataFrame(frames).dropna()
    return combined


def compute_portfolio_performance(timeframe="5Y"):
    # Simulates historical growth of a $10,000 portfolio split equally ($2,000 each)
    close = _get_all_close()

    initial_per_ticker = 2000.0
    # Normalize price series so each ETF starts at $2,000 on day one
    normalized = close / close.iloc[0] * initial_per_ticker

    # The total portfolio value is the sum of the 5 normalized ETF values
    normalized["portfolio"] = normalized[list(TICKERS.keys())].sum(axis=1)

    # Resample daily data to monthly values (taking the last trading day's close of each month)
    monthly = normalized.resample("ME").last().dropna()

    # Filter data based on the requested timeline
    if timeframe == "1Y":
        monthly = monthly.iloc[-12:]
    elif timeframe == "3Y":
        monthly = monthly.iloc[-36:]

    # Format the monthly values as list of dicts for the frontend charts
    result = []
    for date, row in monthly.iterrows():
        entry = {"date": date.strftime("%b %Y")}
        entry["portfolio"] = round(float(row["portfolio"]), 2)
        for ticker in TICKERS:
            entry[ticker] = round(float(row[ticker]), 2)
        result.append(entry)

    return result


def compute_summary():
    # Computes top-level summary metrics for the consolidated portfolio
    close = _get_all_close()
    initial_per_ticker = 2000.0
    initial_total = initial_per_ticker * len(TICKERS)  # Total starts at $10,000

    normalized = close / close.iloc[0] * initial_per_ticker
    portfolio_values = normalized.sum(axis=1)

    current_value = float(portfolio_values.iloc[-1])
    total_return = (current_value - initial_total) / initial_total * 100

    # 1. CAGR (Compound Annual Growth Rate)
    # CAGR = (Current Value / Start Value) ^ (1 / Years) - 1
    n_days = (close.index[-1] - close.index[0]).days
    years = n_days / 365.25
    cagr = ((current_value / initial_total) ** (1 / years) - 1) * 100 if years > 0 else 0

    # 2. Daily Returns & Volatility
    daily_returns = portfolio_values.pct_change().dropna()
    # Volatility = Standard deviation of daily returns * Square root of 252 trading days
    volatility = float(daily_returns.std() * np.sqrt(TRADING_DAYS) * 100)

    # 3. Sharpe Ratio (risk-adjusted return relative to risk-free rate of 4%)
    daily_rf = RISK_FREE_RATE / TRADING_DAYS
    excess = daily_returns - daily_rf
    # Sharpe = average daily excess return / daily volatility, annualized (* sqrt of 252)
    sharpe = float(excess.mean() / excess.std() * np.sqrt(TRADING_DAYS)) if excess.std() > 0 else 0

    # 4. Maximum Drawdown (worst peak-to-trough drop percentage)
    cummax = portfolio_values.cummax()
    drawdown = (portfolio_values - cummax) / cummax
    max_dd = float(drawdown.min() * 100)

    return {
        "portfolio_name": "Global Equal-Weight ETF Portfolio",
        "num_tickers": len(TICKERS),
        "weight_per_ticker": round(100 / len(TICKERS), 2),
        "initial_investment": initial_total,
        "current_value": round(current_value, 2),
        "total_return": round(total_return, 2),
        "cagr": round(cagr, 2),
        "sharpe_ratio": round(sharpe, 2),
        "max_drawdown": round(max_dd, 2),
        "volatility": round(volatility, 2),
    }


def compute_holdings():
    # Computes independent financial performance stats for each individual ETF
    close = _get_all_close()
    holdings = []

    for ticker, name in TICKERS.items():
        prices = close[ticker].dropna()
        if len(prices) < 2:
            continue

        invested = 2000.0
        start_price = float(prices.iloc[0])
        latest_price = float(prices.iloc[-1])
        # Current worth of the initial $2,000 allocation
        current_value = invested * (latest_price / start_price)
        return_pct = (current_value - invested) / invested * 100

        # Calculate CAGR for the single ticker
        n_days = (prices.index[-1] - prices.index[0]).days
        years = n_days / 365.25
        cagr = ((current_value / invested) ** (1 / years) - 1) * 100 if years > 0 else 0

        # Calculate Volatility for the single ticker
        daily_ret = prices.pct_change().dropna()
        vol = float(daily_ret.std() * np.sqrt(TRADING_DAYS) * 100)

        # Calculate Max Drawdown for the single ticker
        cummax = prices.cummax()
        dd = (prices - cummax) / cummax
        max_dd = float(dd.min() * 100)

        # Calculate latest daily price change percentage
        day_change = (float(prices.iloc[-1]) - float(prices.iloc[-2])) / float(prices.iloc[-2]) * 100

        holdings.append({
            "symbol": ticker,
            "name": name,
            "weight": round(100 / len(TICKERS), 2),
            "invested": invested,
            "current_value": round(current_value, 2),
            "return_pct": round(return_pct, 2),
            "cagr": round(cagr, 2),
            "volatility": round(vol, 2),
            "max_drawdown": round(max_dd, 2),
            "latest_price": round(latest_price, 2),
            "day_change_pct": round(day_change, 2),
        })

    return holdings


def get_ohlc_summary(ticker: str):
    # Compiles daily stats and weekly historical close prices for a single selected ticker
    ticker = ticker.upper()
    df = get_ohlc(ticker)
    name = TICKERS.get(ticker, ticker)

    latest_row = df.iloc[-1]
    latest = {
        "date": df.index[-1].strftime("%Y-%m-%d"),
        "open": round(float(latest_row["Open"]), 2),
        "high": round(float(latest_row["High"]), 2),
        "low": round(float(latest_row["Low"]), 2),
        "close": round(float(latest_row["Close"]), 2),
        "volume": int(latest_row["Volume"]),
    }

    # Fetch 52-week High/Low and Average trading volume
    last_252 = df.iloc[-TRADING_DAYS:] if len(df) >= TRADING_DAYS else df
    high_52w = round(float(last_252["High"].max()), 2)
    low_52w = round(float(last_252["Low"].min()), 2)
    avg_volume = int(last_252["Volume"].mean())

    # Resample daily data to weekly to prevent over-plotting on frontend line chart
    weekly = df.resample("W").agg({
        "Open": "first",
        "High": "max",
        "Low": "min",
        "Close": "last",
        "Volume": "sum",
    }).dropna()

    price_data = []
    for date, row in weekly.iterrows():
        price_data.append({
            "date": date.strftime("%Y-%m-%d"),
            "open": round(float(row["Open"]), 2),
            "high": round(float(row["High"]), 2),
            "low": round(float(row["Low"]), 2),
            "close": round(float(row["Close"]), 2),
            "volume": int(row["Volume"]),
        })

    return {
        "ticker": ticker,
        "name": name,
        "latest": latest,
        "high_52w": high_52w,
        "low_52w": low_52w,
        "avg_volume": avg_volume,
        "price_data": price_data,
    }


def generate_insights():
    # Programmatically builds key market insight cards by analyzing the price arrays
    close = _get_all_close()
    insights = []

    # 1. Identify best performer (highest 5-year return)
    returns = {}
    for t in TICKERS:
        prices = close[t]
        returns[t] = (float(prices.iloc[-1]) - float(prices.iloc[0])) / float(prices.iloc[0]) * 100

    best = max(returns, key=returns.get)
    insights.append({
        "title": "Best Performer",
        "value": f"{best} +{returns[best]:.1f}%",
        "description": "Highest 5-year total return in the portfolio",
        "type": "positive",
    })

    # 2. Identify most volatile asset (highest annualized volatility)
    vols = {}
    for t in TICKERS:
        daily_ret = close[t].pct_change().dropna()
        vols[t] = float(daily_ret.std() * np.sqrt(TRADING_DAYS) * 100)

    most_vol = max(vols, key=vols.get)
    insights.append({
        "title": "Most Volatile",
        "value": f"{most_vol} {vols[most_vol]:.1f}%",
        "description": "Highest annualized standard deviation among holdings",
        "type": "neutral",
    })

    # 3. Identify best risk-adjusted asset (highest Sharpe ratio)
    sharpes = {}
    daily_rf = RISK_FREE_RATE / TRADING_DAYS
    for t in TICKERS:
        daily_ret = close[t].pct_change().dropna()
        excess = daily_ret - daily_rf
        s = float(excess.mean() / excess.std() * np.sqrt(TRADING_DAYS)) if excess.std() > 0 else 0
        sharpes[t] = s

    best_sharpe = max(sharpes, key=sharpes.get)
    insights.append({
        "title": "Best Risk-Adjusted",
        "value": f"{best_sharpe} Sharpe {sharpes[best_sharpe]:.2f}",
        "description": "Highest Sharpe ratio (risk-free rate = 4%)",
        "type": "positive",
    })

    # 4. Identify largest drawdown (worst peak-to-trough decline)
    drawdowns = {}
    for t in TICKERS:
        prices = close[t]
        cummax = prices.cummax()
        dd = ((prices - cummax) / cummax).min()
        drawdowns[t] = float(dd * 100)

    worst_dd = min(drawdowns, key=drawdowns.get)
    insights.append({
        "title": "Largest Drawdown",
        "value": f"{worst_dd} {drawdowns[worst_dd]:.1f}%",
        "description": "Worst peak-to-trough decline over 5 years",
        "type": "negative",
    })

    # 5. Calculate diversification benefit (average volatility - portfolio volatility)
    initial_per_ticker = 2000.0
    normalized = close / close.iloc[0] * initial_per_ticker
    portfolio_values = normalized.sum(axis=1)
    port_ret = portfolio_values.pct_change().dropna()
    port_vol = float(port_ret.std() * np.sqrt(TRADING_DAYS) * 100)
    avg_vol = sum(vols.values()) / len(vols)
    benefit = avg_vol - port_vol

    insights.append({
        "title": "Diversification Benefit",
        "value": f"{benefit:.1f}% vol reduction",
        "description": f"Portfolio vol ({port_vol:.1f}%) vs avg ticker vol ({avg_vol:.1f}%)",
        "type": "positive" if benefit > 0 else "neutral",
    })

    # 6. Calculate recent momentum (best performer over the last 3 months)
    momentum = {}
    for t in TICKERS:
        prices = close[t]
        n = min(63, len(prices) - 1)  # 63 trading days is approx 3 months
        momentum[t] = (float(prices.iloc[-1]) - float(prices.iloc[-n])) / float(prices.iloc[-n]) * 100

    best_mom = max(momentum, key=momentum.get)
    sign = "+" if momentum[best_mom] >= 0 else ""
    insights.append({
        "title": "Recent Momentum",
        "value": f"{best_mom} {sign}{momentum[best_mom]:.1f}%",
        "description": "Best performer over the last 3 months",
        "type": "positive" if momentum[best_mom] > 0 else "negative",
    })

    return insights


def get_allocation():
    # Returns equal-weighted allocations for the doughnut chart legend
    tickers_list = list(TICKERS.items())
    result = []
    short_names = {
        "VOO": "VOO - S&P 500",
        "QQQ": "QQQ - Nasdaq 100",
        "VEA": "VEA - Developed Mkts",
        "VWO": "VWO - Emerging Mkts",
        "GLD": "GLD - Gold",
    }
    for i, (ticker, _) in enumerate(tickers_list):
        result.append({
            "name": short_names.get(ticker, ticker),
            "value": round(100 / len(TICKERS), 2),
            "color": COLORS[i % len(COLORS)],
        })
    return result
