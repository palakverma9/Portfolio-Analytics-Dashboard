import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from app.data_service import TICKERS, fetch_all, get_ohlc, is_data_ready
from app import analytics


@asynccontextmanager
async def lifespan(app: FastAPI):
    # This block runs automatically when the backend API server starts up
    try:
        print("[startup] Fetching Yahoo Finance data...")
        # Run the file downloader in a separate thread so it doesn't freeze the server
        await asyncio.to_thread(fetch_all)
        print("[startup] Data ready.")
    except Exception as e:
        print(f"[startup] WARNING: Data fetch failed: {e}")
    yield


# Initialize FastAPI app and link the startup lifespan event
app = FastAPI(
    title="Spring Street Portfolio Analytics API",
    version="2.0.0",
    lifespan=lifespan,
)

# Enable CORS (Cross-Origin Resource Sharing) so the React frontend can talk to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows requests from any origin (e.g., localhost:5173 or localhost:5174)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _check_data():
    # Helper function that returns HTTP 503 if the Yahoo stock files are not downloaded yet
    if not is_data_ready():
        raise HTTPException(
            status_code=503,
            detail="Data is not ready yet. Please wait for initial download."
        )


@app.get("/api/tickers")
def list_tickers():
    # Returns a list of the 5 ETFs with their latest closing price
    _check_data()
    result = []
    for ticker, name in TICKERS.items():
        try:
            df = get_ohlc(ticker)
            latest_price = round(float(df["Close"].iloc[-1]), 2)
        except Exception:
            latest_price = None
        result.append({"symbol": ticker, "name": name, "latest_price": latest_price})
    return result


@app.get("/api/ohlc/{ticker}")
def ohlc_detail(ticker: str):
    # Returns 5-year weekly historical close prices, Open/High/Low/Close details, and 52W stats
    _check_data()
    ticker = ticker.upper()
    if ticker not in TICKERS:
        raise HTTPException(
            status_code=404,
            detail=f"Ticker '{ticker}' not found. Available: {list(TICKERS.keys())}"
        )
    try:
        return analytics.get_ohlc_summary(ticker)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/portfolio/summary")
def portfolio_summary():
    # Returns aggregated metrics for the equal-weighted portfolio (CAGR, Sharpe, Drawdown, Volatility)
    _check_data()
    try:
        return analytics.compute_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/portfolio/performance")
def portfolio_performance(timeframe: str = Query("5Y", description="1Y, 3Y, or 5Y")):
    # Returns historical growth line data comparing the portfolio vs. individual assets
    _check_data()
    if timeframe not in ("1Y", "3Y", "5Y"):
        raise HTTPException(status_code=400, detail="timeframe must be 1Y, 3Y, or 5Y")
    try:
        data = analytics.compute_portfolio_performance(timeframe)
        return {"timeframe": timeframe, "history": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/portfolio/holdings")
def portfolio_holdings():
    # Returns performance metrics for each individual ETF in the portfolio (CAGR, Drawdown, Vol, Return)
    _check_data()
    try:
        return analytics.compute_holdings()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/portfolio/allocation")
def portfolio_allocation():
    # Returns the percentage allocation of the portfolio (equal weight of 20% for each asset)
    _check_data()
    return analytics.get_allocation()


@app.get("/api/insights")
def insights():
    # Returns programmatically generated qualitative insights about performance and risk
    _check_data()
    try:
        return analytics.generate_insights()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
def health():
    # Health check endpoint that frontend calls on boot
    return {
        "status": "healthy",
        "data_ready": is_data_ready(),
        "tickers": list(TICKERS.keys()),
    }
