import React, { useState } from 'react';
import { TrendingUp, TrendingDown, PieChart, BarChart3, LineChart, Layers } from 'lucide-react';
import TradingPieChart from './TradingPieChart';

export default function VisualCharts({ calendarData, analytics, currency = '₹' }) {
  if (!calendarData || !analytics) return null;

  const [activeTab, setActiveTab] = useState('equity'); // 'equity' | 'bars' | 'pie' | 'symbols'
  const [hoveredDay, setHoveredDay] = useState(null);

  const days = calendarData.days || [];
  const tradedDays = days.filter((d) => d.trade_count > 0);

  // 1. Calculate Cumulative Equity Series across the month
  let runningTotal = 0;
  const equityPoints = days.map((d) => {
    runningTotal += d.net_pnl;
    return {
      day: d.day,
      date: d.entry_date,
      dailyNet: d.net_pnl,
      cumulative: Math.round(runningTotal * 100) / 100,
      hasTrades: d.trade_count > 0,
    };
  });

  const cumulativeValues = equityPoints.map((p) => p.cumulative);
  const minEquity = Math.min(0, ...cumulativeValues);
  const maxEquity = Math.max(100, ...cumulativeValues);
  const equityRange = maxEquity - minEquity || 1;

  // SVG dimensions for equity curve
  const svgWidth = 700;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  // Map points to SVG coordinates
  const coords = equityPoints.map((pt, i) => {
    const x = paddingX + (i / Math.max(days.length - 1, 1)) * chartW;
    const normY = (pt.cumulative - minEquity) / equityRange;
    const y = svgHeight - paddingY - normY * chartH;
    return { x, y, ...pt };
  });

  // Zero-line Y coordinate
  const zeroY = svgHeight - paddingY - ((0 - minEquity) / equityRange) * chartH;

  // Build SVG Path
  const linePath = coords.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaPath = coords.length > 0
    ? `${linePath} L ${coords[coords.length - 1].x} ${zeroY} L ${coords[0].x} ${zeroY} Z`
    : '';

  // 2. Daily Waterfall / Bar Chart calculations
  const maxDailyAbs = Math.max(100, ...days.map((d) => Math.abs(d.net_pnl)));
  const barChartH = 180;
  const zeroDailyY = barChartH / 2;

  // 3. Symbol / Instrument breakdown calculation
  const symbolMap = {};
  days.forEach((d) => {
    (d.entries || []).forEach((e) => {
      const sym = e.symbol || 'GENERAL';
      const net = Number(e.pnl_amount) - Number(e.charges || 0);
      if (!symbolMap[sym]) {
        symbolMap[sym] = { symbol: sym, netPnl: 0, trades: 0, wins: 0, losses: 0 };
      }
      symbolMap[sym].netPnl += net;
      symbolMap[sym].trades += 1;
      if (net > 0) symbolMap[sym].wins += 1;
      if (net < 0) symbolMap[sym].losses += 1;
    });
  });
  const symbolList = Object.values(symbolMap).sort((a, b) => b.netPnl - a.netPnl);
  const maxSymbolAbs = Math.max(100, ...symbolList.map((s) => Math.abs(s.netPnl)));

  // 4. Donut Chart Calculations (Win / Loss / Breakeven)
  const totalActive = analytics.trading_days || 0;
  const winCount = analytics.winning_days || 0;
  const lossCount = analytics.losing_days || 0;
  const beCount = analytics.breakeven_days || 0;

  const winAngle = totalActive > 0 ? (winCount / totalActive) * 360 : 0;
  const lossAngle = totalActive > 0 ? (lossCount / totalActive) * 360 : 0;
  const beAngle = totalActive > 0 ? (beCount / totalActive) * 360 : 0;

  // Circumference for 2 * pi * r (r = 40)
  const radius = 40;
  const circ = 2 * Math.PI * radius;
  const winStroke = (winCount / (totalActive || 1)) * circ;
  const lossStroke = (lossCount / (totalActive || 1)) * circ;
  const beStroke = (beCount / (totalActive || 1)) * circ;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-950/50 mb-8 space-y-6">
      {/* Pictorial Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Visual Trading Charts & Analytics
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Interactive
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Pictorial curves, daily waterfall bars, win-rate breakdown, and stock symbol analysis
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('equity')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'equity'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Equity Curve</span>
          </button>

          <button
            onClick={() => setActiveTab('bars')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'bars'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Daily Waterfall</span>
          </button>

          <button
            onClick={() => setActiveTab('pie')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'pie'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Pie Graph</span>
          </button>

          <button
            onClick={() => setActiveTab('symbols')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'symbols'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>By Symbol</span>
          </button>
        </div>
      </div>

      {/* 1. EQUITY CURVE GRAPH */}
      {activeTab === 'equity' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div>
              <span className="font-semibold text-slate-200">Cumulative Month P/L Trend: </span>
              <span className={`font-mono font-bold ${
                runningTotal >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {runningTotal >= 0 ? '+' : ''}{currency}{runningTotal.toFixed(2)}
              </span>
            </div>
            {hoveredDay && (
              <div className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 text-slate-200 font-mono">
                Day {hoveredDay.day}: Net {hoveredDay.dailyNet >= 0 ? '+' : ''}{currency}{hoveredDay.dailyNet.toFixed(2)} | Balance: {currency}{hoveredDay.cumulative.toFixed(2)}
              </div>
            )}
          </div>

          <div className="w-full overflow-x-auto bg-slate-950/70 p-3 sm:p-4 rounded-2xl border border-slate-800/80">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto min-w-[550px] overflow-visible select-none"
            >
              <defs>
                <linearGradient id="equityGradGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="equityGradRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.0" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Zero Guideline */}
              <line
                x1={paddingX}
                y1={zeroY}
                x2={svgWidth - paddingX}
                y2={zeroY}
                stroke="#334155"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text
                x={paddingX - 8}
                y={zeroY + 4}
                fill="#64748b"
                fontSize="10"
                textAnchor="end"
                fontFamily="monospace"
              >
                0
              </text>

              {/* Top value guide */}
              <text
                x={paddingX - 8}
                y={paddingY + 8}
                fill="#10b981"
                fontSize="9"
                textAnchor="end"
                fontFamily="monospace"
              >
                +{currency}{Math.round(maxEquity)}
              </text>

              {/* Bottom value guide */}
              {minEquity < 0 && (
                <text
                  x={paddingX - 8}
                  y={svgHeight - paddingY}
                  fill="#ef4444"
                  fontSize="9"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {currency}{Math.round(minEquity)}
                </text>
              )}

              {/* Shaded Area */}
              {areaPath && (
                <path
                  d={areaPath}
                  fill={runningTotal >= 0 ? "url(#equityGradGreen)" : "url(#equityGradRed)"}
                />
              )}

              {/* Line Curve */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke={runningTotal >= 0 ? "#10b981" : "#ef4444"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data points */}
              {coords.map((pt) => {
                if (!pt.hasTrades) return null;
                const isPos = pt.dailyNet >= 0;
                return (
                  <g
                    key={pt.day}
                    onMouseEnter={() => setHoveredDay(pt)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="4.5"
                      fill={isPos ? "#10b981" : "#ef4444"}
                      stroke="#0f172a"
                      strokeWidth="2"
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* 2. DAILY WATERFALL HISTOGRAM GRAPH */}
      {activeTab === 'bars' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Daily Profit / Loss Heights relative to Zero Axis:</span>
            <div className="flex items-center space-x-3 text-[11px]">
              <span className="flex items-center space-x-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span>Profitable Day</span>
              </span>
              <span className="flex items-center space-x-1 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                <span>Losing Day</span>
              </span>
            </div>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Zero baseline bar container */}
              <div className="relative h-44 flex items-center border-b border-t border-slate-800/80">
                {/* Horizontal Zero Axis Line */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-b border-dashed border-slate-700 z-0" />

                {/* Day Columns */}
                <div className="grid grid-cols-31 w-full h-full gap-1 items-center relative z-10 px-2" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
                  {days.map((d) => {
                    const hasTrades = d.trade_count > 0;
                    const isPos = d.net_pnl >= 0;
                    const heightPercent = hasTrades
                      ? Math.min(100, Math.max(12, Math.round((Math.abs(d.net_pnl) / maxDailyAbs) * 100)))
                      : 0;

                    return (
                      <div
                        key={d.day}
                        className="h-full flex flex-col justify-center items-center group relative cursor-pointer"
                        title={`Day ${d.day}: ${d.net_pnl >= 0 ? '+' : ''}${currency}${d.net_pnl}`}
                      >
                        {/* Hover Tooltip */}
                        {hasTrades && (
                          <div className="absolute -top-8 bg-slate-800 text-slate-200 text-[10px] font-mono px-2 py-0.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 border border-slate-700">
                            Day {d.day}: {isPos ? '+' : ''}{currency}{d.net_pnl}
                          </div>
                        )}

                        {/* Top half (Profits) */}
                        <div className="w-full h-1/2 flex items-end justify-center">
                          {hasTrades && isPos && (
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className="w-full max-w-[12px] bg-emerald-500 rounded-t-sm transition-all group-hover:brightness-125 shadow-sm shadow-emerald-500/20"
                            />
                          )}
                        </div>

                        {/* Bottom half (Losses) */}
                        <div className="w-full h-1/2 flex items-start justify-center">
                          {hasTrades && !isPos && (
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className="w-full max-w-[12px] bg-rose-500 rounded-b-sm transition-all group-hover:brightness-125 shadow-sm shadow-rose-500/20"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Day numbers along bottom */}
              <div className="grid grid-cols-31 w-full text-center pt-2 px-2 text-[9px] font-mono text-slate-500" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
                {days.map((d) => (
                  <div key={d.day} className={d.trade_count > 0 ? 'text-slate-300 font-bold' : ''}>
                    {d.day % 2 !== 0 ? d.day : ''}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. MULTI-SLICE INTERACTIVE PIE GRAPH */}
      {activeTab === 'pie' && (
        <TradingPieChart
          calendarData={calendarData}
          analytics={analytics}
          currency={currency}
        />
      )}

      {/* 4. SYMBOL / INSTRUMENT PICTORIAL BREAKDOWN */}
      {activeTab === 'symbols' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            Net Profit and Loss grouped by stock symbol and instrument:
          </div>

          {symbolList.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
              No stock symbols logged yet this month. Enter symbols like NIFTY, BANKNIFTY, or RELIANCE in your trades.
            </div>
          ) : (
            <div className="space-y-2.5">
              {symbolList.map((s) => {
                const isPos = s.netPnl >= 0;
                const barWidth = Math.min(100, Math.max(8, Math.round((Math.abs(s.netPnl) / maxSymbolAbs) * 100)));

                return (
                  <div
                    key={s.symbol}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-center space-x-3 w-44">
                      <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-100 border border-slate-700">
                        {s.symbol}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {s.trades} {s.trades === 1 ? 'trade' : 'trades'}
                      </span>
                    </div>

                    {/* Pictorial bar */}
                    <div className="flex-1 bg-slate-900 h-5 rounded-lg overflow-hidden relative border border-slate-800">
                      <div
                        style={{ width: `${barWidth}%` }}
                        className={`h-full rounded-lg transition-all ${
                          isPos ? 'bg-emerald-500/40 border-r-2 border-emerald-400' : 'bg-rose-500/40 border-r-2 border-rose-400'
                        }`}
                      />
                    </div>

                    {/* Result amount */}
                    <div className="w-28 text-right font-mono font-bold text-sm">
                      <span className={isPos ? 'text-emerald-400' : 'text-rose-400'}>
                        {isPos ? '+' : ''}{currency}{s.netPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

