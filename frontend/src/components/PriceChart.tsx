import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

type OhlcData = {
  ticker: string;
  name: string;
  latest: { date: string; open: number; high: number; low: number; close: number; volume: number };
  high_52w: number;
  low_52w: number;
  avg_volume: number;
  price_data: { date: string; open: number; high: number; low: number; close: number; volume: number }[];
};

type Props = {
  data: OhlcData | null;
  tickers: string[];
  activeTicker: string;
  onTickerChange: (t: string) => void;
};

function fmtPrice(v: number) {
  return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtVol(v: number) {
  if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M';
  if (v >= 1e3) return (v / 1e3).toFixed(0) + 'K';
  return v.toString();
}

export default function PriceChart({ data, tickers, activeTicker, onTickerChange }: Props) {
  if (!data) {
    return (
      <div className="panel">
        <div className="loading-screen" style={{ minHeight: 200 }}>
          <div className="loader" />
          <span style={{ fontSize: 13, color: 'var(--text-light)' }}>Loading price data...</span>
        </div>
      </div>
    );
  }

  const labels = data.price_data.map(d => d.date);
  const prices = data.price_data.map(d => d.close);

  const chartData = {
    labels,
    datasets: [{
      label: data.ticker,
      data: prices,
      borderColor: '#2563eb',
      backgroundColor: (ctx: any) => {
        const chart = ctx.chart;
        const { ctx: c, chartArea } = chart;
        if (!chartArea) return 'transparent';
        const grad = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        grad.addColorStop(0, 'rgba(37, 99, 235, 0.06)');
        grad.addColorStop(1, 'rgba(37, 99, 235, 0)');
        return grad;
      },
      fill: true,
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 0,
      pointHoverRadius: 3,
    }],
  };

  const opts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1d26',
        titleColor: '#a8afc4',
        bodyColor: '#fff',
        borderColor: '#333',
        borderWidth: 1,
        padding: 8,
        bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
        callbacks: {
          label: (ctx: any) => ` ${fmtPrice(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af', font: { size: 10 }, maxTicksLimit: 8 },
      },
      y: {
        grid: { color: '#f0f1f3' },
        ticks: {
          color: '#9ca3af',
          font: { family: "'JetBrains Mono', monospace", size: 10 },
          callback: (v: number) => '$' + v.toLocaleString(),
        },
      },
    },
  };

  const latest = data.latest;
  const rangeSpan = data.high_52w - data.low_52w;
  const markerPos = rangeSpan > 0 ? ((latest.close - data.low_52w) / rangeSpan) * 100 : 50;

  return (
    <div className="panel animate-in">
      <div className="panel-header">
        <div>
          <div className="panel-title">
            {data.name}
            <span style={{ fontFamily: 'var(--mono)', marginLeft: 10, fontSize: 18, fontWeight: 700 }}>
              {fmtPrice(latest.close)}
            </span>
          </div>
          <div className="panel-subtitle">
            5-year price history · Avg Volume: {fmtVol(data.avg_volume)}
          </div>
        </div>
      </div>

      <div className="ticker-tabs" style={{ marginBottom: 14 }}>
        {tickers.map(t => (
          <button
            key={t}
            className={`ticker-tab ${activeTicker === t ? 'active' : ''}`}
            onClick={() => onTickerChange(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ height: 240 }}>
        <Line data={chartData} options={opts} />
      </div>

      <div className="ohlc-grid">
        <div className="ohlc-item">
          <div className="ohlc-label">Open</div>
          <div className="ohlc-val">{fmtPrice(latest.open)}</div>
        </div>
        <div className="ohlc-item">
          <div className="ohlc-label">High</div>
          <div className="ohlc-val">{fmtPrice(latest.high)}</div>
        </div>
        <div className="ohlc-item">
          <div className="ohlc-label">Low</div>
          <div className="ohlc-val">{fmtPrice(latest.low)}</div>
        </div>
        <div className="ohlc-item">
          <div className="ohlc-label">Close</div>
          <div className="ohlc-val">{fmtPrice(latest.close)}</div>
        </div>
      </div>

      <div className="range-bar-wrap">
        <div className="range-bar-label">
          <span>52W Low: {fmtPrice(data.low_52w)}</span>
          <span>52W High: {fmtPrice(data.high_52w)}</span>
        </div>
        <div className="range-bar">
          <div
            className="marker"
            style={{ left: `calc(${markerPos}% - 6px)` }}
            title={`Current: ${fmtPrice(latest.close)}`}
          />
        </div>
      </div>
    </div>
  );
}
