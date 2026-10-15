import React, { useMemo } from 'react';
import { Trophy, Zap, TrendingDown } from 'lucide-react';

const PALETTE = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b',
  '#ec4899', '#06b6d4', '#ef4444', '#14b8a6', '#6366f1',
];

export default function TopSymbolsLeaderboard({ calendarData, currency = '₹' }) {
  if (!calendarData || !calendarData.days) return null;

  const leaderboard = useMemo(() => {
    const map = {};
    calendarData.days.forEach((d) => {
      (d.entries || []).forEach((e) => {
        const sym = e.symbol || 'GENERAL';
        const net = Number(e.pnl_amount) - Number(e.charges || 0);
        const gross = Number(e.pnl_amount);
        if (!map[sym]) {
          map[sym] = { symbol: sym, netPnl: 0, grossPnl: 0, trades: 0, wins: 0, losses: 0, totalCharges: 0 };
        }
        map[sym].netPnl += net;
        map[sym].grossPnl += gross;
        map[sym].trades += 1;
        map[sym].totalCharges += Number(e.charges || 0);
        if (net > 0) map[sym].wins++;
        if (net < 0) map[sym].losses++;
      });
    });
    return Object.values(map)
      .map((s) => ({
        ...s,
        winRate: s.trades > 0 ? Math.round((s.wins / s.trades) * 100) : 0,
        avgPerTrade: s.trades > 0 ? s.netPnl / s.trades : 0,
      }))
      .sort((a, b) => b.netPnl - a.netPnl);
  }, [calendarData]);

  if (leaderboard.length === 0) return null;

  const maxAbsNet = Math.max(1, ...leaderboard.map((s) => Math.abs(s.netPnl)));
  const topSym = leaderboard[0];
  const bottomSym = leaderboard[leaderboard.length - 1];

  const fmt = (n) => {
    const abs = Math.abs(n);
    if (abs >= 100000) return `${(abs / 100000).toFixed(1)}L`;
    if (abs >= 1000) return `${(abs / 1000).toFixed(1)}K`;
    return abs.toLocaleString('en-IN');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-950/50 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Symbol Performance Leaderboard
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked by net P/L — see which instruments made or cost you the most
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-slate-400 font-mono">{leaderboard.length} symbols</span>
      </div>

      {/* Top / Bottom Highlight */}
      {leaderboard.length >= 2 && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/25 flex items-center space-x-2.5">
            <Trophy className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Best Performer</div>
              <div className="font-mono font-extrabold text-sm text-emerald-400">{topSym.symbol}</div>
              <div className="text-[10px] text-emerald-300 font-mono">+{currency}{fmt(topSym.netPnl)}</div>
            </div>
          </div>
          {bottomSym.netPnl < 0 && (
            <div className="p-3 rounded-2xl bg-rose-950/20 border border-rose-500/20 flex items-center space-x-2.5">
              <TrendingDown className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Biggest Drag</div>
                <div className="font-mono font-extrabold text-sm text-rose-400">{bottomSym.symbol}</div>
                <div className="text-[10px] text-rose-300 font-mono">-{currency}{fmt(bottomSym.netPnl)}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ranked List */}
      <div className="space-y-2">
        {leaderboard.map((sym, idx) => {
          const isPos = sym.netPnl >= 0;
          const barPct = Math.min(100, (Math.abs(sym.netPnl) / maxAbsNet) * 100);
          const color = PALETTE[idx % PALETTE.length];

          return (
            <div key={sym.symbol} className="flex items-center gap-3 group">
              {/* Rank Number */}
              <div className="w-6 text-center text-[11px] font-extrabold text-slate-500 flex-shrink-0">
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
              </div>

              {/* Symbol badge */}
              <div className="w-24 flex-shrink-0">
                <span className="font-mono font-extrabold text-xs px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 block text-center truncate">
                  {sym.symbol}
                </span>
              </div>

              {/* Bar */}
              <div className="flex-1 h-5 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 relative">
                <div
                  style={{ width: `${barPct}%`, backgroundColor: isPos ? '#10b981' : '#ef4444', opacity: 0.5 }}
                  className="h-full rounded-lg transition-all"
                />
                {/* Trade count overlay */}
                <span className="absolute right-2 top-0 bottom-0 flex items-center text-[9px] font-mono text-slate-400">
                  {sym.trades}T · {sym.winRate}%WR
                </span>
              </div>

              {/* P/L amount */}
              <div className="w-24 text-right font-mono font-extrabold text-sm flex-shrink-0">
                <span className={isPos ? 'text-emerald-400' : 'text-rose-400'}>
                  {isPos ? '+' : '-'}{currency}{fmt(sym.netPnl)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

