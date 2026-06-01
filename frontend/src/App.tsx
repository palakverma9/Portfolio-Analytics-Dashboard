import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import StatCards from './components/StatCards';
import PerformanceChart from './components/PerformanceChart';
import PriceChart from './components/PriceChart';
import AllocationChart from './components/AllocationChart';
import HoldingsTable from './components/HoldingsTable';
import InsightsPanel from './components/InsightsPanel';

const API = 'http://127.0.0.1:8000';

async function safeFetch(url: string) {
  const res = await fetch(url);
  if (res.status === 503) throw new Error('LOADING');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function App() {
  const [summary, setSummary] = useState<any>(null);
  const [holdings, setHoldings] = useState<any[]>([]);
  const [allocation, setAllocation] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [tickers, setTickers] = useState<any[]>([]);
  const [ohlcData, setOhlcData] = useState<any>(null);

  const [selectedTicker, setSelectedTicker] = useState('VOO');
  const [timeframe, setTimeframe] = useState('5Y');
  const [activeView, setActiveView] = useState<'overview' | 'assets' | 'holdings'>('overview');

  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // fetch core data on mount
  useEffect(() => {
    setLoading(true);
    Promise.all([
      safeFetch(`${API}/api/portfolio/summary`),
      safeFetch(`${API}/api/portfolio/holdings`),
      safeFetch(`${API}/api/portfolio/allocation`),
      safeFetch(`${API}/api/insights`),
      safeFetch(`${API}/api/tickers`),
    ])
      .then(([s, h, a, ins, t]) => {
        setSummary(s);
        setHoldings(h);
        setAllocation(a);
        setInsights(ins);
        setTickers(t);
        setErr(null);
        setLoading(false);
      })
      .catch(e => {
        if (e.message === 'LOADING') {
          setDataLoading(true);
          setErr(null);
        } else {
          setErr('Cannot connect to backend. Please start the FastAPI server on port 8000.');
        }
        setLoading(false);
      });
  }, []);

  // retry when backend is still downloading data
  useEffect(() => {
    if (!dataLoading) return;
    const timer = setInterval(() => {
      safeFetch(`${API}/api/portfolio/summary`)
        .then(() => {
          setDataLoading(false);
          window.location.reload();
        })
        .catch(() => {});
    }, 3000);
    return () => clearInterval(timer);
  }, [dataLoading]);

  // fetch performance when timeframe changes
  useEffect(() => {
    safeFetch(`${API}/api/portfolio/performance?timeframe=${timeframe}`)
      .then(d => setPerformance(d.history || []))
      .catch(() => {});
  }, [timeframe]);

  // fetch OHLC when ticker changes
  useEffect(() => {
    if (!selectedTicker) return;
    safeFetch(`${API}/api/ohlc/${selectedTicker}`)
      .then(d => setOhlcData(d))
      .catch(() => setOhlcData(null));
  }, [selectedTicker]);

  if (dataLoading) {
    return (
      <div className="error-screen">
        <div className="loader" />
        <h2>Fetching Market Data...</h2>
        <p>The backend is downloading price data from Yahoo Finance. This usually takes 30–60 seconds on first run.</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="error-screen">
        <h2>Connection Error</h2>
        <p>{err}</p>
        <button className="retry-btn" onClick={() => location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  const tickerList = tickers.map((t: any) => ({ symbol: t.symbol, name: t.name }));

  const pageTitle =
    activeView === 'overview'
      ? (summary?.portfolio_name || 'Portfolio Analytics')
      : activeView === 'assets'
      ? 'Asset Explorer'
      : 'Holdings & Insights';

  const pageDesc =
    activeView === 'overview'
      ? `Equal-weighted portfolio of ${summary?.num_tickers || 5} ETFs tracked over 5 years with real-time Yahoo Finance data.`
      : activeView === 'assets'
      ? 'Detailed 5-year price trends, daily OHLC statistics, and 52-week price ranges for individual holdings.'
      : 'Comprehensive performance metrics table and dynamically generated qualitative portfolio insights.';

  return (
    <div className="app-layout">
      <Sidebar
        activeView={activeView}
        onChangeView={setActiveView}
      />

      <main className="main-content">
        {loading || !summary ? (
          <div className="loading-screen">
            <div className="loader" />
            <span style={{ fontSize: 13, color: 'var(--text-light)' }}>
              Loading portfolio...
            </span>
          </div>
        ) : (
          <>
            <div className="page-header">
              <div className="breadcrumb">Spring Street / Portfolio Analytics</div>
              <h1>{pageTitle}</h1>
              <p className="desc">{pageDesc}</p>
            </div>

            {/* Render Dashboard View based on selected Active View */}
            {activeView === 'overview' && (
              <>
                <StatCards data={summary} />
                <div className="panel-row">
                  <div>
                    <PerformanceChart
                      data={performance}
                      timeframe={timeframe}
                      onTimeframeChange={setTimeframe}
                    />
                  </div>
                  <div>
                    <AllocationChart data={allocation} />
                  </div>
                </div>
              </>
            )}

            {activeView === 'assets' && (
              <div className="price-section">
                <PriceChart
                  data={ohlcData}
                  tickers={tickerList.map((t: any) => t.symbol)}
                  activeTicker={selectedTicker}
                  onTickerChange={setSelectedTicker}
                />
              </div>
            )}

            {activeView === 'holdings' && (
              <>
                <HoldingsTable data={holdings} />
                <InsightsPanel data={insights} />
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
