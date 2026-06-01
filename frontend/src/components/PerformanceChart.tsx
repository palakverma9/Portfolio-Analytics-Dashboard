import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

type DataPoint = {
  date: string;
  portfolio: number;
  VOO: number;
  QQQ: number;
  VEA: number;
  VWO: number;
  GLD: number;
};

type Props = {
  data: DataPoint[];
  timeframe: string;
  onTimeframeChange: (t: string) => void;
};

export default function PerformanceChart({ data, timeframe, onTimeframeChange }: Props) {
  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Portfolio',
        data: data.map(d => d.portfolio),
        borderColor: '#2563eb',
        backgroundColor: (ctx: any) => {
          const chart = ctx.chart;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return 'transparent';
          const grad = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          grad.addColorStop(0, 'rgba(37, 99, 235, 0.08)');
          grad.addColorStop(1, 'rgba(37, 99, 235, 0)');
          return grad;
        },
        fill: true,
        borderWidth: 2.5,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: '#2563eb',
      },
      {
        label: 'VOO',
        data: data.map(d => d.VOO),
        borderColor: '#9ca3af',
        borderWidth: 1.5,
        borderDash: [4, 4],
        tension: 0.3,
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'QQQ',
        data: data.map(d => d.QQQ),
        borderColor: '#16a34a',
        borderWidth: 1.5,
        tension: 0.3,
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'VEA',
        data: data.map(d => d.VEA),
        borderColor: '#7c3aed',
        borderWidth: 1.5,
        tension: 0.3,
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'VWO',
        data: data.map(d => d.VWO),
        borderColor: '#ea580c',
        borderWidth: 1.5,
        tension: 0.3,
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'GLD',
        data: data.map(d => d.GLD),
        borderColor: '#d97706',
        borderWidth: 1.5,
        tension: 0.3,
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const opts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: '#8b92a5',
          font: { family: "'DM Sans', sans-serif", size: 11 },
          boxWidth: 10,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 12,
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#1a1d26',
        titleColor: '#a8afc4',
        bodyColor: '#fff',
        borderColor: '#333',
        borderWidth: 1,
        padding: 8,
        titleFont: { size: 11 },
        bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
        callbacks: {
          label: (ctx: any) => {
            const v = ctx.parsed.y;
            return ` ${ctx.dataset.label}: $${v.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
          },
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
    interaction: { mode: 'nearest', axis: 'x', intersect: false },
  };

  return (
    <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <div>
          <div className="panel-title">Growth of $10,000</div>
          <div className="panel-subtitle">Portfolio vs. individual ETFs</div>
        </div>
        <div className="tf-group">
          {['1Y', '3Y', '5Y'].map(t => (
            <button
              key={t}
              className={`tf-btn ${timeframe === t ? 'active' : ''}`}
              onClick={() => onTimeframeChange(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 280 }}>
        <Line data={chartData} options={opts} />
      </div>
    </div>
  );
}
