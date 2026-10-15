import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Filter, X, Eye } from 'lucide-react';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TradingCalendar({
  currentMonth,
  calendarData,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
  onToday,
  currency = '₹'
}) {
  if (!calendarData) return null;

  const [typeFilter, setTypeFilter] = useState('ALL');
  const [symbolFilter, setSymbolFilter] = useState('ALL');
  const [outcomeFilter, setOutcomeFilter] = useState('ALL'); // 'ALL' | 'PROFIT' | 'LOSS'

  const [yearStr, monthStr] = currentMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  // First day of month (0 = Sun, 1 = Mon, ..., 6 = Sat)
  const firstDayWeekday = new Date(year, month - 1, 1).getDay();

  // Format month title
  const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  // Today string YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  // Extract unique symbols for the filter dropdown
  const uniqueSymbols = useMemo(() => {
    const set = new Set();
    calendarData.days.forEach((d) => {
      (d.entries || []).forEach((e) => {
        if (e.symbol) set.add(e.symbol);
      });
    });
    return Array.from(set).sort();
  }, [calendarData]);

  const isFiltering = typeFilter !== 'ALL' || symbolFilter !== 'ALL' || outcomeFilter !== 'ALL';

  const resetFilters = () => {
    setTypeFilter('ALL');
    setSymbolFilter('ALL');
    setOutcomeFilter('ALL');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl shadow-slate-950/50 mb-8">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-emerald-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {monthName}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any date to log profit/loss, view trades, and calculate daily net
            </p>
          </div>
        </div>

        {/* Month Navigation & Today */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onToday}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={onPrevMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onNextMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Calendar Filter Bar */}
      <div className="py-3 px-1 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800/70">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center space-x-1 text-slate-400 font-semibold text-[11px]">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>Filter Calendar:</span>
          </span>

          {/* Trade Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="ALL">All Types</option>
            <option value="Intraday">Intraday</option>
            <option value="Options">Options</option>
            <option value="Futures">Futures</option>
            <option value="Delivery">Delivery</option>
            <option value="Crypto">Crypto</option>
            <option value="Forex">Forex</option>
          </select>

          {/* Symbol Filter */}
          {uniqueSymbols.length > 0 && (
            <select
              value={symbolFilter}
              onChange={(e) => setSymbolFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value="ALL">All Symbols</option>
              {uniqueSymbols.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}

          {/* Outcome Filter */}
          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="ALL">All Outcomes</option>
            <option value="PROFIT">Green Days (+)</option>
            <option value="LOSS">Red Days (-)</option>
          </select>

          {/* Clear Filters Button */}
          {isFiltering && (
            <button
              onClick={resetFilters}
              className="flex items-center space-x-1 px-2 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-slate-700"
            >
              <X className="w-3 h-3 text-rose-400" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {isFiltering && (
          <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
            Filters Active
          </span>
        )}
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3 py-3 text-center border-b border-slate-800/60">
        {WEEKDAYS.map((day, idx) => (
          <div
            key={day}
            className={`text-xs font-bold uppercase tracking-wider ${
              idx === 0 || idx === 6 ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 pt-3">
        {/* Empty cells before month starts */}
        {Array.from({ length: firstDayWeekday }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="min-h-[90px] sm:min-h-[110px] rounded-2xl bg-slate-950/20 border border-transparent opacity-30 cursor-default"
          />
        ))}

        {/* Days of Month */}
        {calendarData.days.map((dayItem) => {
          const dateStr = dayItem.entry_date;
          const isToday = dateStr === todayStr;

          // Filter entries for this day if filters are applied
          const entries = (dayItem.entries || []).filter((e) => {
            const matchType = typeFilter === 'ALL' || e.trade_type === typeFilter;
            const matchSymbol = symbolFilter === 'ALL' || e.symbol === symbolFilter;
            return matchType && matchSymbol;
          });

          const hasFilteredTrades = entries.length > 0;
          const filteredGross = entries.reduce((acc, cur) => acc + Number(cur.pnl_amount), 0);
          const filteredCharges = entries.reduce((acc, cur) => acc + Number(cur.charges || 0), 0);
          const filteredNet = filteredGross - filteredCharges;

          // Outcome filter check
          const matchOutcome = outcomeFilter === 'ALL' || 
            (outcomeFilter === 'PROFIT' && filteredNet > 0) ||
            (outcomeFilter === 'LOSS' && filteredNet < 0);

          const displayTrades = isFiltering ? (hasFilteredTrades && matchOutcome) : dayItem.trade_count > 0;
          const displayNet = isFiltering ? filteredNet : dayItem.net_pnl;
          const displayCount = isFiltering ? entries.length : dayItem.trade_count;
          const displayCharges = isFiltering ? filteredCharges : dayItem.total_charges;

          const isPositive = displayNet > 0;
          const isNegative = displayNet < 0;

          // Dim cell if filtering and this day has no matching trades
          const isDimmed = isFiltering && !displayTrades && dayItem.trade_count > 0;

          return (
            <div
              key={dateStr}
              onClick={() => onSelectDate(dateStr, dayItem)}
              className={`group relative min-h-[95px] sm:min-h-[115px] p-2 sm:p-2.5 rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col justify-between select-none ${
                isDimmed ? 'opacity-35 hover:opacity-100' : ''
              } ${
                isToday ? 'ring-2 ring-emerald-500/70 ring-offset-2 ring-offset-slate-950' : ''
              } ${
                displayTrades
                  ? isPositive
                    ? 'bg-gradient-to-b from-emerald-950/40 to-slate-900 border-emerald-500/40 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-950/50'
                    : isNegative
                    ? 'bg-gradient-to-b from-rose-950/40 to-slate-900 border-rose-500/40 hover:border-rose-400 hover:shadow-lg hover:shadow-rose-950/50'
                    : 'bg-slate-900/90 border-slate-700 hover:border-slate-500'
                  : dayItem.is_holiday
                  ? 'bg-indigo-950/20 border-indigo-500/20 hover:border-indigo-500/40'
                  : dayItem.is_weekend
                  ? 'bg-slate-950/40 border-slate-800/40 hover:border-slate-700/60'
                  : 'bg-slate-900/60 border-slate-800/70 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              {/* Day Number & Badges */}
              <div className="flex items-start justify-between">
                <span
                  className={`text-xs sm:text-sm font-bold rounded-lg px-1.5 py-0.5 ${
                    isToday
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : dayItem.is_weekend
                      ? 'text-slate-500'
                      : 'text-slate-300'
                  }`}
                >
                  {dayItem.day}
                </span>

                {/* Holiday Badge */}
                {dayItem.is_holiday && (
                  <span className="hidden sm:inline-block max-w-[70px] truncate text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {dayItem.holiday_name || 'Holiday'}
                  </span>
                )}

                {/* Trade count badge */}
                {displayTrades && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    isPositive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {displayCount}T
                  </span>
                )}
              </div>

              {/* Day Net P/L Amount */}
              {displayTrades ? (
                <div className="my-auto py-1">
                  <div
                    className={`text-sm sm:text-base font-extrabold font-mono tracking-tight ${
                      isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-slate-300'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {currency}
                    {Math.abs(displayNet).toLocaleString('en-IN', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </div>
                  {displayCharges > 0 && (
                    <div className="text-[10px] text-slate-500 font-mono">
                      -{currency}{displayCharges} fee
                    </div>
                  )}
                </div>
              ) : (
                <div className="my-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-slate-500 text-xs">
                  <span className="flex items-center space-x-1 text-[11px] text-emerald-400 font-medium bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700">
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </span>
                </div>
              )}

              {/* Bottom tag for mobile holiday */}
              {dayItem.is_holiday && (
                <div className="sm:hidden text-[9px] text-indigo-400 truncate">
                  Holiday
                </div>
              )}

              {/* Quick Hover Tooltip showing trade symbols */}
              {dayItem.trade_count > 0 && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 bg-slate-900 border border-slate-700 text-slate-200 p-2 rounded-xl shadow-xl w-44 text-[10px] font-sans">
                  <div className="font-bold border-b border-slate-800 pb-1 mb-1 flex justify-between">
                    <span>Day {dayItem.day} Trades</span>
                    <span className={dayItem.net_pnl >= 0 ? 'text-emerald-400 font-mono' : 'text-rose-400 font-mono'}>
                      {dayItem.net_pnl >= 0 ? '+' : ''}{currency}{dayItem.net_pnl}
                    </span>
                  </div>
                  <div className="space-y-0.5 max-h-24 overflow-y-auto">
                    {(dayItem.entries || []).map((e, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[9px]">
                        <span className="font-mono text-slate-300 truncate max-w-[70px]">{e.symbol || 'GENERAL'}</span>
                        <span className={Number(e.pnl_amount) >= 0 ? 'text-emerald-400 font-mono' : 'text-rose-400 font-mono'}>
                          {Number(e.pnl_amount) >= 0 ? '+' : ''}{currency}{Number(e.pnl_amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
