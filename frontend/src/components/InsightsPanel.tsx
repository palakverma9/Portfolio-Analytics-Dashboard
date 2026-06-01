type Insight = {
  title: string;
  value: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
};

type Props = { data: Insight[] };

function colorFor(type: string) {
  if (type === 'positive') return 'var(--green)';
  if (type === 'negative') return 'var(--red)';
  return 'var(--accent)';
}

export default function InsightsPanel({ data }: Props) {
  if (!data.length) return null;

  return (
    <div style={{ marginTop: 20 }}>
      <div className="panel-title" style={{ marginBottom: 4 }}>Market Insights</div>
      <div className="panel-subtitle">Key observations from portfolio analysis</div>

      <div className="insights-grid">
        {data.map((item, i) => (
          <div className="insight-card animate-in" key={i}>
            <div className="insight-title">{item.title}</div>
            <div className="insight-value" style={{ color: colorFor(item.type) }}>
              {item.value}
            </div>
            <div className="insight-desc">{item.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
