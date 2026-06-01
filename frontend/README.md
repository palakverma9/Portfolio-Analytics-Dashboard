# Portfolio Analytics Dashboard — Frontend

This directory houses the React (TypeScript) frontend client for the Spring Street Portfolio Analytics Dashboard.

## Getting Started

1. Install required Node modules:
   ```bash
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The client will typically load on `http://localhost:5173/` or `http://localhost:5174/`.

## Key Dependencies

* **react-chartjs-2 & chart.js**: Canvas-based interactive charting libraries used to plot portfolio growth timelines and allocation splits.
* **lucide-react**: Lightweight icon set for visual hierarchy.

## Codebase Overview

* [src/App.tsx](file:///C:/Users/pglit/OneDrive/Desktop/portfolio-analytics-dashboard/frontend/src/App.tsx): Manages selection states, handles loading spinners, queries FastAPI API endpoints, and coordinates data flow.
* [src/index.css](file:///C:/Users/pglit/OneDrive/Desktop/portfolio-analytics-dashboard/frontend/src/index.css): Design system styles, typography configurations, and keyframe entrance animations.
* [src/components/](file:///C:/Users/pglit/OneDrive/Desktop/portfolio-analytics-dashboard/frontend/src/components/): Modular React widgets:
  * `Sidebar`: Brand logo and ETF picker.
  * `StatCards`: Annualized metrics overview cards.
  * `PerformanceChart`: Timeline growth area graphs.
  * `PriceChart`: 5-year close prices, OHLC statistics, and 52-week price range sliders.
  * `AllocationChart`: Doughnut chart of asset split.
  * `HoldingsTable`: Searchable, sortable holdings grids.
  * `InsightsPanel`: Dynamic colored insights cards.
