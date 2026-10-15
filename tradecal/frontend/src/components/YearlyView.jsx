import React from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Calendar, Award } from 'lucide-react';

export default function YearlyView({
  year,
  onYearChange,
  yearlyData,
  onSelectMonth,
  currency = '₹'
}) {
  if (!yearlyData) return null;

  const isNetPos = yearlyData.net_pnl >= 0;

  return (
    <div className="space-y-6">
      {/* Year Selector & Annual Summary */}
      <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-black text-white">{year} Annual Performance</h2>
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 ml-3">
              <button
                onClick={() => onYearChange(year - 1)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-mono text-sm font-bold text-slate-200">{year}</span>
              <button
                onClick={() => onYearChange(year + 1)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">Full year trading journal breakdown by month</p>
        </div>

        {/* Annual KPIs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className={`px-4 py-2.5 rounded-2xl border ${
            isNetPos ? 'bg-emerald-950/40 border-emerald-500/30' : 'bg-rose-950/40 border-rose-500/30'
          }`}>
            <span className="text-[10px] text-slate-400 block font-medium">Year Net P/L</span>
            <span className={`text-lg sm:text-xl font-black font-mono ${
              isNetPos ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {isNetPos ? '+' : ''}{currency}{yearlyData.net_pnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">Annual Win Rate</span>
            <span className="text-lg sm:text-xl font-bold font-mono text-amber-400">
              {yearlyData.win_rate}%
            </span>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">Total Trades</span>
            <span className="text-lg sm:text-xl font-bold font-mono text-slate-200">
              {yearlyData.total_trades}
            </span>
          </div>
        </div>
      </div>

      {/* 12-Month Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {yearlyData.monthly_breakdown.map((m) => {
          const hasActivity = m.trades > 0;
          const isMonthPos = m.net_pnl >= 0;

          return (
            <div
              key={m.month}
              onClick={() => onSelectMonth(m.month)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                hasActivity
                  ? isMonthPos
                    ? 'bg-slate-900 border-emerald-500/30 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-950/40'
                    : 'bg-slate-900 border-rose-500/30 hover:border-rose-400 hover:shadow-lg hover:shadow-rose-950/40'
                  : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm text-slate-200 group-hover:text-emerald-400 transition-colors">
                  {m.month_name}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {m.month}
                </span>
              </div>

              <div className="my-2">
                {hasActivity ? (
                  <div>
                    <div className={`text-xl font-extrabold font-mono ${
                      isMonthPos ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {isMonthPos ? '+' : ''}{currency}{m.net_pnl.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {m.winning_days}W / {m.losing_days}L • {m.trades} trades
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-600 font-mono py-2">
                    No trades recorded
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 group-hover:text-slate-200">
                <span>View Calendar</span>
                <Calendar className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

