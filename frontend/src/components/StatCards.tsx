type Props = {
  data: {
    current_value: number;
    initial_investment: number;
    total_return: number;
    cagr: number;
    sharpe_ratio: number;
    max_drawdown: number;
    volatility: number;
  };
};

function fmt(val: number) {
  return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function StatCards({ data }: Props) {
  const isUp = data.total_return >= 0;

  return (
    <div className="stats-row">
      <div className="stat-card animate-in">
        <div className="label">Portfolio Value</div>
        <div className="value">{fmt(data.current_value)}</div>
        <div className="sub">
          Invested: {fmt(data.initial_investment)}
        </div>
      </div>

      <div className="stat-card animate-in">
        <div className="label">Total Return</div>
        <div className={`value ${isUp ? 'positive' : 'negative'}`}>
          {isUp ? '+' : ''}{data.total_return.toFixed(2)}%
        </div>
        <div className="sub">
          <span className={`change ${isUp ? 'positive' : 'negative'}`}>
            {isUp ? '↑' : '↓'} {fmt(data.current_value - data.initial_investment)}
          </span>
        </div>
      </div>

      <div className="stat-card animate-in">
        <div className="label">CAGR (5Y)</div>
        <div className={`value ${data.cagr >= 0 ? 'positive' : 'negative'}`}>
          {data.cagr.toFixed(2)}%
        </div>
        <div className="sub">Annualized growth rate</div>
      </div>

      <div className="stat-card animate-in">
        <div className="label">Risk Metrics</div>
        <div className="value" style={{ fontSize: 18 }}>
          Sharpe {data.sharpe_ratio.toFixed(2)}
        </div>
        <div className="sub">
          <span>Max DD:</span>
          <span className="change negative" style={{ marginLeft: 4 }}>
            {data.max_drawdown.toFixed(1)}%
          </span>
          <span style={{ marginLeft: 8 }}>Vol: {data.volatility.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
