import React, { useState, useMemo } from 'react';
import { Flame, TrendingDown, Activity, Award, AlertTriangle } from 'lucide-react';

export default function StreakTracker({ calendarData, analytics, currency = '₹' }) {
  if (!calendarData || !calendarData.days) return null;

  const days = calendarData.days;

  // ── Compute metrics ──────────────────────────────────────────────
  const tradedDays = days.filter((d) => d.trade_count > 0);

  // Cumulative equity series (all days, including zero-trade ones)
  let running = 0;
  const equitySeries = days.map((d) => {
    running += d.net_pnl;
    return { day: d.day, cum: running, hasTrades: d.trade_count > 0, net: d.net_pnl };
  });

  // Streak calculation on traded days only
  let curWinStreak = 0, curLossStreak = 0, maxWinStreak = 0, maxLossStreak = 0;
  let tempWin = 0, tempLoss = 0;
  for (const d of tradedDays) {
    if (d.net_pnl > 0) {
      tempWin++;
      tempLoss = 0;
      curLossStreak = 0;
    } else if (d.net_pnl < 0) {
      tempLoss++;
      tempWin = 0;
      curWinStreak = 0;
    } else {
      tempWin = 0;
      tempLoss = 0;
    }
    if (tempWin > maxWinStreak) maxWinStreak = tempWin;
    if (tempLoss > maxLossStreak) maxLossStreak = tempLoss;
  }
  // The last running values are the current streaks
  for (let i = tradedDays.length - 1; i >= 0; i--) {
    if (tradedDays[i].net_pnl > 0 && curWinStreak === 0) {
      // Count trailing wins
      let k = i;
      while (k >= 0 && tradedDays[k].net_pnl > 0) { curWinStreak++; k--; }
      break;
    } else if (tradedDays[i].net_pnl < 0 && curLossStreak === 0) {
      let k = i;
      while (k >= 0 && tradedDays[k].net_pnl < 0) { curLossStreak++; k--; }
      break;
    }
    break;
  }
  // Recalculate properly
  curWinStreak = 0; curLossStreak = 0;
  for (let i = tradedDays.length - 1; i >= 0; i--) {
    const net = tradedDays[i].net_pnl;
    if (i === tradedDays.length - 1) {
      if (net > 0) curWinStreak = 1;
      else if (net < 0) curLossStreak = 1;
      else break;
    } else {
      if (curWinStreak > 0 && net > 0) curWinStreak++;
      else if (curLossStreak > 0 && net < 0) curLossStreak++;
      else break;
    }
  }

  // Drawdown computation on cumulative equity
  let peakEquity = 0, maxDrawdown = 0, currentDrawdown = 0;
  let peakSoFar = 0;
  const equityWithDD = equitySeries.map((pt) => {
    if (pt.cum > peakSoFar) peakSoFar = pt.cum;
    const dd = peakSoFar - pt.cum;
    if (dd > maxDrawdown) maxDrawdown = dd;
    return { ...pt, peak: peakSoFar, drawdown: dd };
  });
  peakEquity = Math.max(0, ...equitySeries.map((p) => p.cum));
  currentDrawdown = peakEquity - running;
  const ddPct = peakEquity > 0 ? (maxDrawdown / peakEquity) * 100 : 0;
  const curDdPct = peakEquity > 0 ? (currentDrawdown / peakEquity) * 100 : 0;

  const ddColor = ddPct > 10 ? 'text-rose-400' : ddPct > 5 ? 'text-amber-400' : 'text-emerald-400';

  // ── SVG Drawdown Chart ────────────────────────────────────────────
  const svgW = 700, svgH = 180, padX = 40, padY = 20;
  const chartW = svgW - padX * 2, chartH = svgH - padY * 2;

  const allCum = equityWithDD.map((p) => p.cum);
  const allPeak = equityWithDD.map((p) => p.peak);
  const minVal = Math.min(0, ...allCum);
  const maxVal = Math.max(1, ...allPeak);
  const range = maxVal - minVal || 1;

  const toY = (v) => svgH - padY - ((v - minVal) / range) * chartH;
  const toX = (i) => padX + (i / Math.max(equityWithDD.length - 1, 1)) * chartW;

  const equityPath = equityWithDD
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(pt.cum)}`)
    .join(' ');
  const peakPath = equityWithDD
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(pt.peak)}`)
    .join(' ');

  // Red filled area = between peak and equity
  const ddAreaPath = equityWithDD.length > 0
    ? [
        ...equityWithDD.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(pt.peak)}`),
        ...equityWithDD.slice().reverse().map((pt, i, arr) => `L ${toX(arr.length - 1 - i)} ${toY(pt.cum)}`),
        'Z',
      ].join(' ')
    : '';

  const zeroY = toY(0);
  const curStreak = curWinStreak > 0 ? curWinStreak : curLossStreak;
  const isWinStreak = curWinStreak > 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-950/50 mb-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Streak & Drawdown Tracker
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Monitor winning/losing streaks and maximum equity drawdown
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Current Streak */}
        <div className={`p-4 rounded-2xl border ${
          isWinStreak ? 'bg-emerald-950/30 border-emerald-500/30' : curLossStreak > 0 ? 'bg-rose-950/30 border-rose-500/30' : 'bg-slate-950/70 border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Current Streak
            </span>
            {curStreak >= 3 && <span className="text-base">🔥</span>}
          </div>
          <div className={`text-2xl font-black font-mono ${
            isWinStreak ? 'text-emerald-400' : curLossStreak > 0 ? 'text-rose-400' : 'text-slate-400'
          }`}>
            {curStreak > 0 ? curStreak : 0}
            <span className="text-xs font-bold ml-1">
              {isWinStreak ? 'W' : curLossStreak > 0 ? 'L' : '—'}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {isWinStreak ? 'wins in a row' : curLossStreak > 0 ? 'losses in a row' : 'no active streak'}
          </div>
        </div>

        {/* Best Streak */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Best Streak</span>
            <Award className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">
            {maxWinStreak}<span className="text-xs ml-1 font-bold">W</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">longest win run</div>
        </div>

        {/* Max Drawdown */}
        <div className={`p-4 rounded-2xl border ${ddPct > 10 ? 'bg-rose-950/20 border-rose-500/20' : 'bg-slate-950/70 border-slate-800'}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Max Drawdown</span>
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className={`text-2xl font-black font-mono ${ddColor}`}>
            {currency}{Math.round(maxDrawdown).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">from peak equity</div>
        </div>

        {/* Drawdown % */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">DD %</span>
            <AlertTriangle className={`w-3.5 h-3.5 ${ddColor}`} />
          </div>
          <div className={`text-2xl font-black font-mono ${ddColor}`}>
            {ddPct.toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {ddPct > 10 ? '⚠️ High drawdown' : ddPct > 5 ? '⚡ Moderate' : '✅ Controlled'}
          </div>
        </div>
      </div>

      {/* Peak & Current DD info */}
      <div className="flex flex-wrap gap-4 px-1 text-xs font-mono text-slate-400">
        <span>Peak Equity: <span className="text-emerald-400 font-bold">{currency}{Math.round(peakEquity).toLocaleString('en-IN')}</span></span>
        <span>Current DD from Peak: <span className={`font-bold ${currentDrawdown > 0 ? 'text-rose-400' : 'text-slate-300'}`}>{currentDrawdown > 0 ? `-${currency}${Math.round(currentDrawdown).toLocaleString('en-IN')} (-${curDdPct.toFixed(1)}%)` : 'None (at peak)'}</span></span>
        <span>Worst Losing Streak: <span className="text-rose-400 font-bold">{maxLossStreak}L</span></span>
      </div>

      {/* Drawdown SVG Chart */}
      {tradedDays.length > 0 && (
        <div className="bg-slate-950/70 rounded-2xl border border-slate-800/80 p-3 overflow-x-auto">
          <div className="text-xs text-slate-400 mb-2 font-semibold">Equity Curve with Drawdown Zones</div>
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="w-full h-auto min-w-[500px] select-none"
          >
            <defs>
              <linearGradient id="equityGreenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Zero line */}
            <line x1={padX} y1={zeroY} x2={svgW - padX} y2={zeroY}
              stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
            <text x={padX - 6} y={zeroY + 4} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">0</text>

            {/* Red drawdown area (between peak and equity) */}
            {ddAreaPath && (
              <path d={ddAreaPath} fill="#ef4444" fillOpacity="0.15" />
            )}

            {/* Green equity area */}
            <path
              d={`${equityPath} L ${toX(equityWithDD.length - 1)} ${zeroY} L ${toX(0)} ${zeroY} Z`}
              fill="url(#equityGreenGrad)"
            />

            {/* Peak tracking line */}
            <path d={peakPath} fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="5 3" opacity="0.6" />

            {/* Equity curve */}
            <path d={equityPath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Day labels */}
            {equityWithDD.filter((_, i) => i % 5 === 0 || i === equityWithDD.length - 1).map((pt, _, arr) => {
              const idx = equityWithDD.indexOf(pt);
              return (
                <text key={idx} x={toX(idx)} y={svgH - 2} fill="#475569" fontSize="8" textAnchor="middle" fontFamily="monospace">
                  {pt.day}
                </text>
              );
            })}
          </svg>
          <div className="flex items-center space-x-4 mt-2 text-[10px] text-slate-500">
            <span className="flex items-center space-x-1"><span className="w-4 h-0.5 bg-emerald-400 inline-block" /> <span>Equity</span></span>
            <span className="flex items-center space-x-1"><span className="w-4 h-0.5 bg-amber-400 inline-block border-dashed" style={{borderTop:'1px dashed #f59e0b',background:'none'}} /> <span>Peak</span></span>
            <span className="flex items-center space-x-1"><span className="w-4 h-2 bg-rose-500/30 inline-block rounded-sm" /> <span>Drawdown zone</span></span>
          </div>
        </div>
      )}
    </div>
  );
}

