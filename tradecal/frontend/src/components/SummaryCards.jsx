import React from 'react';
import { TrendingUp, TrendingDown, Award, Receipt, Hash, CalendarCheck } from 'lucide-react';

export default function SummaryCards({ data, currency = '₹' }) {
  if (!data) return null;

  const isNetProfit = data.net_pnl >= 0;
  const netFormatted = `${data.net_pnl >= 0 ? '+' : ''}${currency}${Math.abs(data.net_pnl).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. Monthly Net P/L */}
      <div className={`p-4 rounded-2xl border transition-all col-span-2 sm:col-span-1 lg:col-span-2 ${
        isNetProfit
          ? 'bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border-emerald-500/30 shadow-lg shadow-emerald-950/40'
          : 'bg-gradient-to-br from-rose-950/60 via-slate-900 to-slate-900 border-rose-500/30 shadow-lg shadow-rose-950/40'
      }`}>
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1.5">
          <span>Monthly Net P/L</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            isNetProfit ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
          }`}>
            {isNetProfit ? 'Profit' : 'Loss'}
          </span>
        </div>
        <div className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight flex items-baseline space-x-1 ${
          isNetProfit ? 'text-emerald-400' : 'text-rose-400'
        }`}>
          <span>{netFormatted}</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
          <span>Gross: {currency}{data.gross_profit?.toLocaleString('en-IN') || 0}</span>
          <span>Losses: {currency}{data.gross_loss?.toLocaleString('en-IN') || 0}</span>
        </div>
      </div>

      {/* 2. Winning Days */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
          <span>Winning Days</span>
          <TrendingUp className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {data.winning_days || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {data.trading_days ? `${Math.round((data.winning_days / data.trading_days) * 100)}% of active days` : '0 days active'}
          </div>
        </div>
      </div>

      {/* 3. Losing Days */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
          <span>Losing Days</span>
          <TrendingDown className="w-4 h-4 text-rose-400" />
        </div>
        <div>
          <div className="text-2xl font-bold font-mono text-rose-400">
            {data.losing_days || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {data.breakeven_days ? `${data.breakeven_days} breakeven` : '0 breakeven'}
          </div>
        </div>
      </div>

      {/* 4. Win Rate */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
          <span>Win Rate</span>
          <Award className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {data.win_rate !== undefined ? `${data.win_rate}%` : '0%'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {data.trading_days || 0} traded days
          </div>
        </div>
      </div>

      {/* 5. Charges / Brokerage */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
          <span>Total Charges</span>
          <Receipt className="w-4 h-4 text-slate-400" />
        </div>
        <div>
          <div className="text-2xl font-bold font-mono text-slate-200">
            {currency}{data.total_charges?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {data.total_trades || 0} total trades
          </div>
        </div>
      </div>
    </div>
  );
}

