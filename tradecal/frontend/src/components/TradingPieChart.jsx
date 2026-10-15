import React, { useState, useMemo } from 'react';
import { PieChart as PieIcon, Layers, Award, Disc } from 'lucide-react';

const PALETTE = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#ef4444', // red
  '#14b8a6', // teal
  '#6366f1', // indigo
];

// SVG Polar to Cartesian helper
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

// Generate SVG Path for a pie slice wedge
function describePieSlice(x, y, radius, startAngle, endAngle) {
  const angleDiff = Math.min(endAngle - startAngle, 359.99);
  const start = polarToCartesian(x, y, radius, startAngle + angleDiff);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = angleDiff <= 180 ? '0' : '1';

  return [
    'M', x, y,
    'L', end.x, end.y,
    'A', radius, radius, 0, largeArcFlag, 1, start.x, start.y,
    'Z'
  ].join(' ');
}

export default function TradingPieChart({ calendarData, analytics, currency = '₹' }) {
  const [pieMode, setPieMode] = useState('types'); // 'types' | 'winloss' | 'symbols'
  const [chartStyle, setChartStyle] = useState('donut'); // 'donut' | 'pie'
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const days = calendarData?.days || [];

  // 1. Trade Type Breakdown Data
  const typeSlices = useMemo(() => {
    const map = {};
    days.forEach((d) => {
      (d.entries || []).forEach((e) => {
        const type = e.trade_type || 'Intraday';
        const net = Number(e.pnl_amount) - Number(e.charges || 0);
        if (!map[type]) {
          map[type] = { label: type, count: 0, netPnl: 0, grossProfit: 0, grossLoss: 0 };
        }
        map[type].count += 1;
        map[type].netPnl += net;
        if (net > 0) map[type].grossProfit += net;
        if (net < 0) map[type].grossLoss += Math.abs(net);
      });
    });

    const list = Object.values(map);
    const totalTrades = list.reduce((acc, cur) => acc + cur.count, 0);

    return list.map((item, idx) => ({
      ...item,
      value: item.count,
      percent: totalTrades > 0 ? (item.count / totalTrades) * 100 : 0,
      color: PALETTE[idx % PALETTE.length],
    })).sort((a, b) => b.value - a.value);
  }, [days]);

  // 2. Win / Loss / Breakeven Days Data
  const winLossSlices = useMemo(() => {
    const totalDays = analytics?.trading_days || 0;
    const wins = analytics?.winning_days || 0;
    const losses = analytics?.losing_days || 0;
    const be = analytics?.breakeven_days || 0;

    const list = [
      {
        label: 'Winning Days',
        value: wins,
        count: wins,
        netPnl: analytics?.gross_profit || 0,
        percent: totalDays > 0 ? (wins / totalDays) * 100 : 0,
        color: '#10b981', // green
      },
      {
        label: 'Losing Days',
        value: losses,
        count: losses,
        netPnl: -(analytics?.gross_loss || 0),
        percent: totalDays > 0 ? (losses / totalDays) * 100 : 0,
        color: '#ef4444', // red
      },
    ];

    if (be > 0) {
      list.push({
        label: 'Breakeven Days',
        value: be,
        count: be,
        netPnl: 0,
        percent: totalDays > 0 ? (be / totalDays) * 100 : 0,
        color: '#64748b', // slate
      });
    }

    return list.filter((s) => s.value > 0);
  }, [analytics]);

  // 3. Stock / Symbol Breakdown Data
  const symbolSlices = useMemo(() => {
    const map = {};
    days.forEach((d) => {
      (d.entries || []).forEach((e) => {
        const sym = e.symbol || 'GENERAL';
        const net = Number(e.pnl_amount) - Number(e.charges || 0);
        if (!map[sym]) {
          map[sym] = { label: sym, count: 0, netPnl: 0 };
        }
        map[sym].count += 1;
        map[sym].netPnl += net;
      });
    });

    const list = Object.values(map);
    const totalTrades = list.reduce((acc, cur) => acc + cur.count, 0);

    return list.map((item, idx) => ({
      ...item,
      value: item.count,
      percent: totalTrades > 0 ? (item.count / totalTrades) * 100 : 0,
      color: PALETTE[(idx + 2) % PALETTE.length],
    })).sort((a, b) => b.value - a.value);
  }, [days]);

  // Current active dataset
  const activeSlices = useMemo(() => {
    if (pieMode === 'winloss') return winLossSlices;
    if (pieMode === 'symbols') return symbolSlices;
    return typeSlices;
  }, [pieMode, winLossSlices, symbolSlices, typeSlices]);

  const totalValue = activeSlices.reduce((acc, s) => acc + s.value, 0);

  // Compute SVG arc angles
  const calculatedSlices = useMemo(() => {
    if (totalValue === 0) return [];
    let currentAngle = 0;

    return activeSlices.map((slice) => {
      const sliceAngle = (slice.value / totalValue) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      currentAngle = endAngle;

      return {
        ...slice,
        startAngle,
        endAngle,
      };
    });
  }, [activeSlices, totalValue]);

  const hoveredSlice = hoveredIndex !== null ? calculatedSlices[hoveredIndex] : null;

  const cx = 110;
  const cy = 110;
  const radius = 95;
  const innerRadius = chartStyle === 'donut' ? 58 : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-950/50 mb-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Interactive Trading Pie Graph
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Multi-Slice Visual
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Breakdown your trading performance by Trade Type, Win vs Loss, and Instruments
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Tabs */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => { setPieMode('types'); setHoveredIndex(null); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                pieMode === 'types'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              By Trade Type
            </button>
            <button
              onClick={() => { setPieMode('winloss'); setHoveredIndex(null); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                pieMode === 'winloss'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Win vs Loss
            </button>
            <button
              onClick={() => { setPieMode('symbols'); setHoveredIndex(null); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                pieMode === 'symbols'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              By Symbol
            </button>
          </div>

          {/* Style Toggle (Donut vs Solid Pie) */}
          <button
            onClick={() => setChartStyle(chartStyle === 'donut' ? 'pie' : 'donut')}
            className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold flex items-center space-x-1"
            title="Toggle between Donut & Solid Pie"
          >
            <Disc className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline capitalize">{chartStyle}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {calculatedSlices.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
          <PieIcon className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
          <span>No trading data available for this month to generate pie chart slices.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left: SVG Pie Graphic */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-950/70 rounded-2xl border border-slate-800/80">
            <div className="relative w-56 h-56 flex items-center justify-center">
              <svg
                viewBox="0 0 220 220"
                className="w-full h-full overflow-visible select-none drop-shadow-md"
              >
                {/* Render Pie Slices */}
                {calculatedSlices.map((slice, idx) => {
                  const isHovered = hoveredIndex === idx;
                  const pathData = describePieSlice(cx, cy, radius, slice.startAngle, slice.endAngle);

                  return (
                    <g
                      key={slice.label}
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className="cursor-pointer transition-transform duration-200"
                      style={{
                        transformOrigin: `${cx}px ${cy}px`,
                        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                      }}
                    >
                      <path
                        d={pathData}
                        fill={slice.color}
                        stroke="#0f172a"
                        strokeWidth="2"
                        className="transition-all duration-150"
                        opacity={hoveredIndex === null || isHovered ? 1 : 0.45}
                      />
                    </g>
                  );
                })}

                {/* Inner Cutout for Donut Mode */}
                {chartStyle === 'donut' && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={innerRadius}
                    fill="#020617"
                    stroke="#1e293b"
                    strokeWidth="1.5"
                  />
                )}
              </svg>

              {/* Center Details Display for Donut Mode */}
              {chartStyle === 'donut' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-2">
                  {hoveredSlice ? (
                    <>
                      <span className="text-[10px] font-bold text-slate-400 uppercase truncate max-w-[90px]">
                        {hoveredSlice.label}
                      </span>
                      <span className="text-base font-extrabold font-mono text-white leading-tight">
                        {hoveredSlice.percent.toFixed(1)}%
                      </span>
                      <span className={`text-[10px] font-mono font-bold mt-0.5 ${
                        hoveredSlice.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {hoveredSlice.netPnl >= 0 ? '+' : ''}{currency}{Math.round(hoveredSlice.netPnl)}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl font-black font-mono text-white">
                        {totalValue}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {pieMode === 'winloss' ? 'Days' : 'Trades'}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-500 font-mono mt-3">
              Hover over any slice or legend item for details
            </div>
          </div>

          {/* Right: Interactive Legend & Statistics Cards */}
          <div className="md:col-span-7 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
              <span className="font-semibold uppercase tracking-wider text-[11px]">Category Breakdown</span>
              <span className="font-mono text-[11px]">Share % & Net P/L</span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {calculatedSlices.map((slice, idx) => {
                const isHovered = hoveredIndex === idx;
                const isPos = slice.netPnl >= 0;

                return (
                  <div
                    key={slice.label}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isHovered
                        ? 'bg-slate-800/90 border-slate-700 shadow-md scale-[1.01]'
                        : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0 transition-transform"
                        style={{
                          backgroundColor: slice.color,
                          transform: isHovered ? 'scale(1.25)' : 'scale(1)',
                        }}
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-200">
                          {slice.label}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {slice.value} {slice.value === 1 ? 'entry' : 'entries'} ({slice.percent.toFixed(1)}%)
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-xs font-black font-mono ${
                        isPos ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isPos ? '+' : ''}{currency}{slice.netPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Net P/L
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

