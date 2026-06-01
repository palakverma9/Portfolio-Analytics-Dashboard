import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip);

type Slice = { name: string; value: number; color: string };
type Props = { data: Slice[] };

export default function AllocationChart({ data }: Props) {
  const chartData = {
    labels: data.map(d => d.name),
    datasets: [{
      data: data.map(d => d.value),
      backgroundColor: data.map(d => d.color || '#2563eb'),
      borderWidth: 2,
      borderColor: '#ffffff',
      hoverOffset: 3,
    }],
  };

  const opts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` ${ctx.label}: ${ctx.raw}%`,
        },
      },
    },
    cutout: '68%',
  };

  return (
    <div className="panel animate-in" style={{ height: '100%' }}>
      <div className="panel-title" style={{ marginBottom: 4 }}>Allocation</div>
      <div className="panel-subtitle" style={{ marginBottom: 16 }}>
        Equal-weighted across {data.length} ETFs
      </div>

      <div className="alloc-row">
        <div className="alloc-chart-wrap">
          <Doughnut data={chartData} options={opts} />
        </div>
        <div className="alloc-legend">
          {data.map((item, i) => (
            <div className="legend-item" key={i}>
              <span className="name">
                <span className="dot" style={{ background: item.color }} />
                {item.name}
              </span>
              <span className="pct">{item.value.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
