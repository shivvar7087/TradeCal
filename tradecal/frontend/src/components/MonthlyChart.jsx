import React from 'react';
import { TrendingUp, TrendingDown, Award, ArrowUpRight, ArrowDownRight, Layers, ShieldCheck, Scale, Zap, PieChart } from 'lucide-react';
import VisualCharts from './VisualCharts';

export default function MonthlyChart({ analytics, calendarData, currency = '₹' }) {
  if (!analytics || !calendarData) return null;

  // Key Trading Performance Metrics
  const grossProfit = analytics.gross_profit || 0;
  const grossLoss = analytics.gross_loss || 0;
  const winDays = analytics.winning_days || 0;
  const lossDays = analytics.losing_days || 0;
  const tradingDays = analytics.trading_days || 0;

  const profitFactor = grossLoss > 0 
    ? (grossProfit / grossLoss).toFixed(2) 
    : grossProfit > 0 ? '∞' : '0.00';

  const avgWinDay = winDays > 0 ? grossProfit / winDays : 0;
  const avgLossDay = lossDays > 0 ? grossLoss / lossDays : 0;
  const winLossRatio = avgLossDay > 0 ? (avgWinDay / avgLossDay).toFixed(2) : (avgWinDay > 0 ? '∞' : '0.00');

  const winRateFrac = tradingDays > 0 ? winDays / tradingDays : 0;
  const lossRateFrac = tradingDays > 0 ? lossDays / tradingDays : 0;
  const expectancy = (winRateFrac * avgWinDay) - (lossRateFrac * avgLossDay);

  return (
    <div className="space-y-6 mb-8">
      {/* Top Highlights KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Best Day */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg shadow-slate-950/30">
          <div>
            <div className="text-xs text-slate-400 font-medium">Best Trading Day</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
              {analytics.best_day ? `+${currency}${analytics.best_day.amount.toLocaleString('en-IN')}` : 'N/A'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {analytics.best_day ? analytics.best_day.date : 'No trades logged yet'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        {/* Worst Day */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg shadow-slate-950/30">
          <div>
            <div className="text-xs text-slate-400 font-medium">Worst Trading Day</div>
            <div className="text-xl font-bold font-mono text-rose-400 mt-1">
              {analytics.worst_day ? `${currency}${analytics.worst_day.amount.toLocaleString('en-IN')}` : 'N/A'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {analytics.worst_day ? analytics.worst_day.date : 'No losses logged'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>

        {/* Profit Factor */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg shadow-slate-950/30">
          <div>
            <div className="text-xs text-slate-400 font-medium">Profit Factor</div>
            <div className={`text-xl font-bold font-mono mt-1 ${
              Number(profitFactor) >= 1.5 || profitFactor === '∞' ? 'text-emerald-400' : Number(profitFactor) >= 1 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {profitFactor}x
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Gross Wins / Gross Losses
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
        </div>

        {/* Daily Average */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg shadow-slate-950/30">
          <div>
            <div className="text-xs text-slate-400 font-medium">Average Daily Net</div>
            <div className={`text-xl font-bold font-mono mt-1 ${
              analytics.avg_daily_pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {analytics.avg_daily_pnl >= 0 ? '+' : ''}{currency}{analytics.avg_daily_pnl?.toLocaleString('en-IN') || 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Across {analytics.trading_days || 0} active trading days
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Advanced Trader Risk Matrix */}
      <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-3xl shadow-xl shadow-slate-950/50">
        <div className="flex items-center space-x-2 pb-4 border-b border-slate-800">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Risk & Expectancy Metrics
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
          <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80">
            <span className="text-[11px] text-slate-500 block">Avg Winning Day</span>
            <span className="text-base font-extrabold font-mono text-emerald-400">
              +{currency}{avgWinDay.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">{winDays} winning days</span>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80">
            <span className="text-[11px] text-slate-500 block">Avg Losing Day</span>
            <span className="text-base font-extrabold font-mono text-rose-400">
              -{currency}{avgLossDay.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">{lossDays} losing days</span>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80">
            <span className="text-[11px] text-slate-500 block">Win / Loss Ratio</span>
            <span className="text-base font-extrabold font-mono text-amber-400">
              {winLossRatio} : 1
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Payout ratio</span>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80">
            <span className="text-[11px] text-slate-500 block">Daily Expectancy</span>
            <span className={`text-base font-extrabold font-mono ${
              expectancy >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {expectancy >= 0 ? '+' : ''}{currency}{expectancy.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Expected profit/day</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Pictorial Graphs (Equity Curve, Waterfall, Pie Graph, Symbols) */}
      <VisualCharts
        calendarData={calendarData}
        analytics={analytics}
        currency={currency}
      />

      {/* P/L Breakdown Ratio */}
      <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-3xl">
        <h4 className="text-sm font-bold text-slate-200 mb-3">Gross Wins vs Gross Losses Capital Ratio</h4>
        <div className="h-4 rounded-full bg-slate-950 overflow-hidden flex border border-slate-800">
          <div
            style={{
              width: `${(analytics.gross_profit + analytics.gross_loss > 0)
                ? (analytics.gross_profit / (analytics.gross_profit + analytics.gross_loss)) * 100
                : 50}%`
            }}
            className="bg-emerald-500 transition-all"
            title={`Gross Profit: ${currency}${analytics.gross_profit}`}
          />
          <div
            style={{
              width: `${(analytics.gross_profit + analytics.gross_loss > 0)
                ? (analytics.gross_loss / (analytics.gross_profit + analytics.gross_loss)) * 100
                : 50}%`
            }}
            className="bg-rose-500 transition-all"
            title={`Gross Losses: ${currency}${analytics.gross_loss}`}
          />
        </div>
        <div className="flex items-center justify-between text-xs mt-2 text-slate-400 font-mono">
          <span className="text-emerald-400">Total Wins: +{currency}{analytics.gross_profit?.toLocaleString('en-IN')}</span>
          <span className="text-rose-400">Total Losses: -{currency}{analytics.gross_loss?.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
}
