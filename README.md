# Spring Street — Portfolio Analytics Dashboard

This is a full-stack web application built for the Spring Street Software Development Internship role. It analyzes an equal-weighted global investment portfolio (comprising VOO, QQQ, VEA, VWO, and GLD ETFs) using live stock market data fetched from Yahoo Finance.

---

## Architecture & Approach
The project follows a modern client-server architecture:
1. **Backend (Python + FastAPI)**: 
   * Acts as the data hub. It contacts the Yahoo Finance API on startup to download 5 years of daily price history.
   * **Smart Cache**: To avoid hitting API rate limits and keep the dashboard fast, it saves downloaded price data as local CSV files. It only downloads new data once a day.
   * **Math Engine**: Processes price data using Pandas and NumPy to calculate returns, CAGR, annual volatility, Sharpe ratios, peak drawdowns, and portfolio diversification benefits.
2. **Frontend (React + TypeScript + Chart.js)**:
   * Acts as the visual dashboard. It queries the FastAPI server and visualizes the figures in interactive line graphs, doughnut charts, sorting tables, and insights cards.
   * Includes built-in auto-retry polling: if the backend is busy downloading Yahoo Finance data on the very first boot, the frontend displays a loading message and retries every 3 seconds until it's ready.

---

## Environment Variables & Configuration
* **No configuration or API keys required**: The application is fully self-contained and pre-configured to run out-of-the-box.
* **No environment variables needed**: Default hosts, ports, and data settings are hardcoded for easy, one-click local execution.

---

## Step-by-Step Setup & Local Run Guide

### 1. Start the Backend API (Python)
1. Open your terminal (e.g., Command Prompt or PowerShell).
2. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the server:
   ```bash
   python -m uvicorn app.main:app --port 8000
   ```
   *The API will start running at `http://127.0.0.1:8000`. On first run, it will automatically download ETF data from Yahoo Finance.*

### 2. Start the Frontend Dashboard (React)
1. Open a second terminal window.
2. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
3. Install the Node packages:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your web browser and go to the link shown in the terminal (usually `http://localhost:5173/` or `http://localhost:5174/`).

---

## API Endpoints List
* `GET /api/health` — Checks if the server and cached data are ready.
* `GET /api/tickers` — Retrieves latest prices for the 5 ETFs.
* `GET /api/ohlc/{ticker}` — Retrieves 5-year history and 52-week high/low limits.
* `GET /api/portfolio/summary` — Retrieves portfolio-level growth and risk metrics.
* `GET /api/portfolio/performance` — Retrieves chronological growth points.
* `GET /api/portfolio/holdings` — Retrieves individual holdings statistics (CAGR, drawdown, Vol).
* `GET /api/portfolio/allocation` — Retrieves percentage allocations.
* `GET /api/insights` — Retrieves automated performance insights.
