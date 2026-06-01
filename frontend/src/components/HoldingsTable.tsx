import { useState } from 'react';

type Holding = {
  symbol: string;
  name: string;
  weight: number;
  invested: number;
  current_value: number;
  return_pct: number;
  cagr: number;
  volatility: number;
  max_drawdown: number;
  latest_price: number;
  day_change_pct: number;
};

type SortKey = 'symbol' | 'name' | 'weight' | 'current_value' | 'return_pct' | 'cagr' | 'volatility' | 'max_drawdown';

type Props = { data: Holding[] };

export default function HoldingsTable({ data }: Props) {
  const [sortBy, setSortBy] = useState<SortKey>('weight');
  const [asc, setAsc] = useState(false);

  function toggleSort(key: SortKey) {
    if (sortBy === key) {
      setAsc(!asc);
    } else {
      setSortBy(key);
      setAsc(false);
    }
  }

  // Sort the holdings data dynamically based on the active header column
  const sorted = [...data].sort((a, b) => {
    const av = a[sortBy];
    const bv = b[sortBy];
    if (typeof av === 'string' && typeof bv === 'string')
      return asc ? av.localeCompare(bv) : bv.localeCompare(av);
    return asc ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });

  const arrow = (key: SortKey) => {
    if (sortBy !== key) return '';
    return asc ? ' ↑' : ' ↓';
  };

  function fmt(v: number) {
    return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return (
    <div className="holdings-panel animate-in">
      <div className="holdings-top">
        <div className="panel-title">Holdings</div>
      </div>

      <div className="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th onClick={() => toggleSort('symbol')}>Ticker{arrow('symbol')}</th>
              <th onClick={() => toggleSort('name')}>Name{arrow('name')}</th>
              <th className="right" onClick={() => toggleSort('weight')}>Weight{arrow('weight')}</th>
              <th className="right">Invested</th>
              <th className="right" onClick={() => toggleSort('current_value')}>Value{arrow('current_value')}</th>
              <th className="right" onClick={() => toggleSort('return_pct')}>Return{arrow('return_pct')}</th>
              <th className="right" onClick={() => toggleSort('cagr')}>CAGR{arrow('cagr')}</th>
              <th className="right" onClick={() => toggleSort('volatility')}>Vol{arrow('volatility')}</th>
              <th className="right" onClick={() => toggleSort('max_drawdown')}>Max DD{arrow('max_drawdown')}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(h => {
              const up = h.return_pct >= 0;
              return (
                <tr key={h.symbol}>
                  <td className="sym">{h.symbol}</td>
                  <td>{h.name}</td>
                  <td className="num">{h.weight.toFixed(1)}%</td>
                  <td className="num">{fmt(h.invested)}</td>
                  <td className="num" style={{ fontWeight: 600 }}>{fmt(h.current_value)}</td>
                  <td className="num">
                    <span className={up ? 'positive' : 'negative'} style={{ fontWeight: 600 }}>
                      {up ? '+' : ''}{h.return_pct.toFixed(2)}%
                    </span>
                  </td>
                  <td className="num">{h.cagr.toFixed(2)}%</td>
                  <td className="num">{h.volatility.toFixed(1)}%</td>
                  <td className="num">
                    <span className="negative">{h.max_drawdown.toFixed(1)}%</span>
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: 24, color: 'var(--text-light)' }}>
                  No holdings data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
