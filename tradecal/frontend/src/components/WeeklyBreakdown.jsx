import React, { useMemo } from 'react';
import { BarChart2, TrendingUp, TrendingDown, Star } from 'lucide-react';

function weekOf(day, month, year) {
  // Return week number within the month (1-indexed)
  // Week 1 = days 1-7, Week 2 = 8-14, etc.
  return Math.ceil(day / 7);
}

export default function WeeklyBreakdown({ calendarData, currency = '₹' }) {
  if (!calendarData || !calendarData.days || calendarData.days.length === 0) return null;

  const days = calendarData.days;
  const monthStr = calendarData.month || '';
  const [year, month] = monthStr.split('-').map(Number);

  const weeks = useMemo(() => {
    const weekMap = {};
    days.forEach((d) => {
      const wk = weekOf(d.day, month, year);
      if (!weekMap[wk]) {
        weekMap[wk] = {
          week: wk,
          days: [],
          startDay: d.day,
          endDay: d.day,
          netPnl: 0,
          trades: 0,
          wins: 0,
          losses: 0,
          bestDay: null,
          worstDay: null,
        };
      }
      weekMap[wk].endDay = d.day;
      weekMap[wk].days.push(d);
      if (d.trade_count > 0) {
        weekMap[wk].netPnl += d.net_pnl;
        weekMap[wk].trades += d.trade_count;
        if (d.net_pnl > 0) weekMap[wk].wins++;
        if (d.net_pnl < 0) weekMap[wk].losses++;
        if (!weekMap[wk].bestDay || d.net_pnl > weekMap[wk].bestDay.net_pnl) {
          weekMap[wk].bestDay = d;
        }
        if (!weekMap[wk].worstDay || d.net_pnl < weekMap[wk].worstDay.net_pnl) {
          weekMap[wk].worstDay = d;
        }
      }
    });
    return Object.values(weekMap).sort((a, b) => a.week - b.week);
  }, [days, month, year]);

  const allNetPnls = weeks.map((w) => w.netPnl);
  const bestWeekNet = Math.max(...allNetPnls);
  const worstWeekNet = Math.min(...allNetPnls);
  const maxAbsNet = Math.max(1, ...weeks.map((w) => Math.abs(w.netPnl)));

  const fmt = (n) => Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-950/50 mb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
        <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
          <BarChart2 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Week-by-Week Performance Breakdown
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Analyse your trading consistency across each week of the month
          </p>
        </div>
      </div>

      {/* Week Cards */}
      <div className="space-y-3">
        {weeks.map((wk) => {
          const isPos = wk.netPnl >= 0;
          const isNeg = wk.netPnl < 0;
          const isBestWeek = wk.netPnl === bestWeekNet && wk.trades > 0;
          const isWorstWeek = wk.netPnl === worstWeekNet && wk.trades > 0 && worstWeekNet < 0;
          const barPct = maxAbsNet > 0 ? Math.min(100, (Math.abs(wk.netPnl) / maxAbsNet) * 100) : 0;
          const winRate = (wk.wins + wk.losses) > 0 ? Math.round((wk.wins / (wk.wins + wk.losses)) * 100) : 0;

          return (
            <div
              key={wk.week}
              className={`p-4 rounded-2xl border transition-all ${
                isBestWeek
                  ? 'border-amber-500/40 bg-amber-950/20'
                  : isWorstWeek
                  ? 'border-rose-500/30 bg-rose-950/10'
                  : 'border-slate-800/80 bg-slate-950/50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Left: Week label + badges */}
                <div className="flex items-center space-x-3 min-w-[120px]">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-sm font-extrabold text-slate-200">
                        Week {wk.week}
                      </span>
                      {isBestWeek && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {monthStr}-{String(wk.startDay).padStart(2, '0')} → {monthStr}-{String(wk.endDay).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* Center: Visual bar */}
                <div className="flex-1 mx-0 sm:mx-4">
                  {wk.trades > 0 ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div
                          style={{ width: `${barPct}%` }}
                          className={`h-full rounded-full transition-all ${isPos ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-600 italic">No trades this week</div>
                  )}
                  {wk.trades > 0 && (
                    <div className="flex items-center space-x-3 mt-1.5 text-[10px] text-slate-500">
                      <span>{wk.trades} trades</span>
                      <span className="text-emerald-400">{wk.wins}W</span>
                      <span className="text-rose-400">{wk.losses}L</span>
                      {winRate > 0 && <span className="text-amber-400">{winRate}% WR</span>}
                    </div>
                  )}
                </div>

                {/* Right: Net P/L */}
                <div className="text-right min-w-[100px]">
                  {wk.trades > 0 ? (
                    <>
                      <div className={`text-base font-extrabold font-mono ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPos ? '+' : '-'}{currency}{fmt(wk.netPnl)}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Best: {wk.bestDay ? `+${currency}${fmt(wk.bestDay.net_pnl)}` : '—'}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm font-mono text-slate-600">—</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Summary Footer */}
      {weeks.some((w) => w.trades > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/60">
          <div className="text-center">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider">Best Week</div>
            <div className="text-sm font-extrabold font-mono text-emerald-400 mt-0.5">
              +{currency}{fmt(bestWeekNet)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider">Worst Week</div>
            <div className={`text-sm font-extrabold font-mono mt-0.5 ${worstWeekNet < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {worstWeekNet < 0 ? `-${currency}${fmt(worstWeekNet)}` : `+${currency}${fmt(worstWeekNet)}`}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider">Active Weeks</div>
            <div className="text-sm font-extrabold font-mono text-slate-200 mt-0.5">
              {weeks.filter((w) => w.trades > 0).length}/{weeks.length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider">Green Weeks</div>
            <div className="text-sm font-extrabold font-mono text-emerald-400 mt-0.5">
              {weeks.filter((w) => w.netPnl > 0).length} / {weeks.filter((w) => w.trades > 0).length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

