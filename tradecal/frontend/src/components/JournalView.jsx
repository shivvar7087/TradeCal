import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, TrendingUp, TrendingDown, ArrowUpDown, Calendar, FileText } from 'lucide-react';
import { api } from '../api/client';

export default function JournalView({
  calendarData,
  onOpenEntryModal,
  onEntriesChanged,
  currency = '₹'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [outcomeFilter, setOutcomeFilter] = useState('ALL'); // 'ALL' | 'PROFIT' | 'LOSS'
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc' | 'date-asc' | 'pnl-desc' | 'pnl-asc'
  const [deletingId, setDeletingId] = useState(null);

  // Flatten all entries from calendarData.days
  const allEntries = useMemo(() => {
    if (!calendarData || !calendarData.days) return [];
    const list = [];
    calendarData.days.forEach((day) => {
      (day.entries || []).forEach((entry) => {
        const net = Number(entry.pnl_amount) - Number(entry.charges || 0);
        list.push({
          ...entry,
          net_pnl: net,
          date: day.entry_date,
        });
      });
    });
    return list;
  }, [calendarData]);

  // Filter and sort entries
  const filteredEntries = useMemo(() => {
    return allEntries.filter((item) => {
      // Search
      const searchMatch = !searchTerm || 
        (item.symbol && item.symbol.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.note && item.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.trade_type && item.trade_type.toLowerCase().includes(searchTerm.toLowerCase()));

      // Type
      const typeMatch = typeFilter === 'ALL' || item.trade_type === typeFilter;

      // Outcome
      const outcomeMatch = outcomeFilter === 'ALL' || 
        (outcomeFilter === 'PROFIT' && item.net_pnl > 0) ||
        (outcomeFilter === 'LOSS' && item.net_pnl < 0);

      return searchMatch && typeMatch && outcomeMatch;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'pnl-desc') return b.net_pnl - a.net_pnl;
      if (sortBy === 'pnl-asc') return a.net_pnl - b.net_pnl;
      return 0;
    });
  }, [allEntries, searchTerm, typeFilter, outcomeFilter, sortBy]);

  // Aggregate stats of filtered entries
  const stats = useMemo(() => {
    let gross = 0;
    let charges = 0;
    let net = 0;
    let wins = 0;
    let losses = 0;

    filteredEntries.forEach((e) => {
      gross += Number(e.pnl_amount);
      charges += Number(e.charges || 0);
      net += e.net_pnl;
      if (e.net_pnl > 0) wins++;
      if (e.net_pnl < 0) losses++;
    });

    return {
      count: filteredEntries.length,
      gross,
      charges,
      net,
      wins,
      losses,
      winRate: filteredEntries.length > 0 ? Math.round((wins / filteredEntries.length) * 100) : 0,
    };
  }, [filteredEntries]);

  const handleDelete = async (entry) => {
    if (!window.confirm(`Delete trade entry for ${entry.symbol || 'GENERAL'} on ${entry.date}?`)) return;
    setDeletingId(entry.id);
    try {
      await api.deleteEntry(entry.id);
      if (onEntriesChanged) {
        await onEntriesChanged(entry.date);
      }
    } catch (err) {
      alert('Failed to delete trade: ' + (err.message || err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Top Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-950/50 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Trading Journal Log
              </h2>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {stats.count} {stats.count === 1 ? 'Trade' : 'Trades'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Itemized ledger of all trades executed this month with filter, search, and instant editing
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onOpenEntryModal(new Date().toISOString().split('T')[0])}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Log New Trade</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search symbol, notes, strategy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Trade Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Trade Types</option>
              <option value="Intraday">Intraday</option>
              <option value="Options">Options</option>
              <option value="Futures">Futures</option>
              <option value="Delivery">Delivery</option>
              <option value="Crypto">Crypto</option>
              <option value="Forex">Forex</option>
            </select>
          </div>

          {/* Outcome Filter */}
          <div>
            <select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Outcomes</option>
              <option value="PROFIT">Profitable Trades Only (+)</option>
              <option value="LOSS">Losing Trades Only (-)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="pnl-desc">Net P/L (Highest Profit)</option>
              <option value="pnl-asc">Net P/L (Largest Loss)</option>
            </select>
          </div>
        </div>

        {/* Filtered Quick Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-500 block text-[10px] font-semibold">FILTERED NET P/L</span>
            <span className={`text-sm font-black font-mono ${
              stats.net >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {stats.net >= 0 ? '+' : ''}{currency}{stats.net.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-500 block text-[10px] font-semibold">CHARGES / FEES</span>
            <span className="text-sm font-bold font-mono text-slate-300">
              {currency}{stats.charges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-500 block text-[10px] font-semibold">WIN / LOSS RATIO</span>
            <span className="text-sm font-bold font-mono text-slate-200">
              <span className="text-emerald-400">{stats.wins}W</span> : <span className="text-rose-400">{stats.losses}L</span>
            </span>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-500 block text-[10px] font-semibold">FILTERED WIN RATE</span>
            <span className="text-sm font-bold font-mono text-amber-400">
              {stats.winRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Trades Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl shadow-slate-950/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Symbol</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4 text-right">Gross P/L</th>
                <th className="py-3.5 px-4 text-right">Charges</th>
                <th className="py-3.5 px-4 text-right">Net P/L</th>
                <th className="py-3.5 px-4">Strategy & Notes</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    <span>No trades match your search criteria.</span>
                  </td>
                </tr>
              ) : (
                filteredEntries.map((trade) => {
                  const isPos = trade.net_pnl >= 0;
                  return (
                    <tr
                      key={trade.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-300 whitespace-nowrap">
                        {trade.date}
                      </td>

                      {/* Symbol */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-extrabold text-xs px-2 py-0.5 rounded-lg bg-slate-800 text-slate-100 border border-slate-700">
                          {trade.symbol || 'GENERAL'}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {trade.trade_type || 'Intraday'}
                        </span>
                      </td>

                      {/* Gross P/L */}
                      <td className={`py-3.5 px-4 text-right font-mono font-bold ${
                        Number(trade.pnl_amount) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {Number(trade.pnl_amount) >= 0 ? '+' : ''}{currency}{Number(trade.pnl_amount).toFixed(2)}
                      </td>

                      {/* Charges */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                        {currency}{Number(trade.charges || 0).toFixed(2)}
                      </td>

                      {/* Net P/L */}
                      <td className={`py-3.5 px-4 text-right font-mono font-black text-sm ${
                        isPos ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isPos ? '+' : ''}{currency}{trade.net_pnl.toFixed(2)}
                      </td>

                      {/* Notes / Strategy */}
                      <td className="py-3.5 px-4 text-slate-300 max-w-[220px] truncate" title={trade.note || ''}>
                        {trade.note || <span className="text-slate-600 italic">No notes</span>}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => onOpenEntryModal(trade.date)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Edit trade in day modal"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(trade)}
                            disabled={deletingId === trade.id}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors disabled:opacity-50"
                            title="Delete trade"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

