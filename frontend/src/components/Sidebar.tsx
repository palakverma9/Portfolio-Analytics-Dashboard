type ViewType = 'overview' | 'assets' | 'holdings';

type Props = {
  activeView: ViewType;
  onChangeView: (v: ViewType) => void;
};

export default function Sidebar({ activeView, onChangeView }: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="logo">
          <div className="logo-icon">SS</div>
          <span className="logo-text">Spring Street</span>
        </div>

        <div className="section-label" style={{ marginBottom: 6 }}>Navigation</div>
        <ul className="nav-list">
          <li
            className={`nav-item ${activeView === 'overview' ? 'active' : ''}`}
            onClick={() => onChangeView('overview')}
          >
            <span className="item-name">Overview Dashboard</span>
            <span className="item-sub">Growth & allocations</span>
          </li>
          <li
            className={`nav-item ${activeView === 'assets' ? 'active' : ''}`}
            onClick={() => onChangeView('assets')}
          >
            <span className="item-name">Asset Explorer</span>
            <span className="item-sub">OHLC & 52W prices</span>
          </li>
          <li
            className={`nav-item ${activeView === 'holdings' ? 'active' : ''}`}
            onClick={() => onChangeView('holdings')}
          >
            <span className="item-name">Holdings & Insights</span>
            <span className="item-sub">Sortable table & metrics</span>
          </li>
        </ul>
      </div>

      <div className="sidebar-footer">
        <div>support@springstreet.in</div>
        <div>© 2026 Spring Street Wealth</div>
      </div>
    </aside>
  );
}
