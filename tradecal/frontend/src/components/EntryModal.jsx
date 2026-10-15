import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, TrendingUp, TrendingDown, Check, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';

const QUICK_SYMBOLS = ['NIFTY', 'BANKNIFTY', 'RELIANCE', 'TATASTEEL', 'HDFCBANK', 'INFY'];
const TRADE_TYPES = ['Intraday', 'Options', 'Futures', 'Delivery', 'Crypto', 'Forex'];
const QUICK_STRATEGIES = ['Breakout', 'Reversal', 'Scalp', 'Trend Follow', 'Strict SL', 'FOMO', 'Overtrading'];
const MOODS = [
  { emoji: '😊', label: 'Confident' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '😤', label: 'Greedy' },
  { emoji: '😰', label: 'Fearful' },
  { emoji: '🎯', label: 'Disciplined' },
];

// Parse rating and mood out of note metadata suffix
function parseNoteMeta(rawNote) {
  if (!rawNote) return { baseNote: '', rating: 0, mood: '' };
  // Pattern: " | ⭐3 | 😊 Confident" at end
  const metaRegex = /\s*\|\s*⭐(\d)\s*(?:\|\s*(.+))?$/;
  const match = rawNote.match(metaRegex);
  if (match) {
    const rating = parseInt(match[1], 10);
    const moodStr = match[2] ? match[2].trim() : '';
    const baseNote = rawNote.replace(metaRegex, '').trim();
    return { baseNote, rating, mood: moodStr };
  }
  return { baseNote: rawNote, rating: 0, mood: '' };
}

// Build note with metadata suffix appended
function buildNoteWithMeta(baseNote, rating, mood) {
  const parts = [baseNote.trim()].filter(Boolean);
  if (rating > 0) parts.push(`⭐${rating}`);
  if (mood) parts.push(mood);
  if (parts.length === 1) return parts[0];
  const [first, ...rest] = parts;
  return rest.length > 0 ? `${first} | ${rest.join(' | ')}` : first;
}

export default function EntryModal({
  dateStr,
  dayData,
  onClose,
  onEntriesChanged,
  currency = '₹'
}) {
  const [entries, setEntries] = useState(dayData?.entries || []);
  const [isProfit, setIsProfit] = useState(true);
  const [amount, setAmount] = useState('');
  const [charges, setCharges] = useState('0');
  const [symbol, setSymbol] = useState('');
  const [tradeType, setTradeType] = useState('Intraday');
  const [note, setNote] = useState('');
  const [rating, setRating] = useState(0);
  const [mood, setMood] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Edit state
  const [editingEntryId, setEditingEntryId] = useState(null);

  // Parse date nicely
  const dateObj = new Date(dateStr + 'T00:00:00');
  const dateFormatted = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Fetch fresh entries on mount and whenever date changes
  const reloadDayEntries = async () => {
    try {
      const fresh = await api.getEntries(null, dateStr);
      if (Array.isArray(fresh)) {
        setEntries(fresh);
      }
    } catch (e) {
      if (dayData?.entries) setEntries(dayData.entries);
    }
  };

  useEffect(() => {
    reloadDayEntries();
  }, [dateStr]);

  const handleStartEdit = (entry) => {
    setEditingEntryId(entry.id);
    const pnl = Number(entry.pnl_amount);
    setIsProfit(pnl >= 0);
    setAmount(Math.abs(pnl).toString());
    setCharges(entry.charges?.toString() || '0');
    setSymbol(entry.symbol || '');
    setTradeType(entry.trade_type || 'Intraday');
    const { baseNote, rating: r, mood: m } = parseNoteMeta(entry.note || '');
    setNote(baseNote);
    setRating(r);
    setMood(m);
    setError(null);
    setSuccessMessage(null);
  };

  const handleCancelEdit = () => {
    setEditingEntryId(null);
    setAmount('');
    setCharges('0');
    setSymbol('');
    setNote('');
    setRating(0);
    setMood('');
    setIsProfit(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    const parsedCharges = parseFloat(charges) || 0;
    const finalPnl = isProfit ? parsedAmount : -parsedAmount;

    setLoading(true);
    try {
      const builtNote = buildNoteWithMeta(note, rating, mood) || null;
      if (editingEntryId) {
        await api.updateEntry(editingEntryId, {
          entry_date: dateStr,
          symbol: symbol.trim() || null,
          trade_type: tradeType,
          pnl_amount: finalPnl,
          charges: parsedCharges,
          note: builtNote,
        });
        setSuccessMessage('Trade entry updated successfully!');
      } else {
        await api.createEntry({
          entry_date: dateStr,
          symbol: symbol.trim() || null,
          trade_type: tradeType,
          pnl_amount: finalPnl,
          charges: parsedCharges,
          note: builtNote,
        });
        setSuccessMessage('Trade added and saved to calendar!');
      }

      handleCancelEdit();
      await reloadDayEntries();
      if (onEntriesChanged) {
        onEntriesChanged(dateStr);
      }

      // Clear success notification after 4s
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setError(err.message || 'Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (entryId) => {
    if (!window.confirm('Delete this trade entry?')) return;
    setLoading(true);
    setError(null);
    try {
      await api.deleteEntry(entryId);
      setSuccessMessage('Trade deleted successfully.');
      await reloadDayEntries();
      if (onEntriesChanged) {
        onEntriesChanged(dateStr);
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete entry');
    } finally {
      setLoading(false);
    }
  };

  // Compute live day summary from entries
  const totalGross = entries.reduce((acc, e) => acc + Number(e.pnl_amount), 0);
  const totalCharges = entries.reduce((acc, e) => acc + Number(e.charges || 0), 0);
  const totalNet = totalGross - totalCharges;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              {dateFormatted}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter your trade details to save and calculate daily net totals
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Daily Summary Bar */}
        <div className="p-4 sm:px-6 bg-slate-950/70 border-b border-slate-800/80">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">Gross P/L</span>
              <span className={`text-sm sm:text-base font-bold font-mono ${
                totalGross >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {totalGross >= 0 ? '+' : ''}{currency}{totalGross.toFixed(2)}
              </span>
            </div>
            <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">Charges/Taxes</span>
              <span className="text-sm sm:text-base font-bold font-mono text-slate-300">
                {currency}{totalCharges.toFixed(2)}
              </span>
            </div>
            <div className={`p-3 rounded-2xl border ${
              totalNet >= 0
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-950/30 border-rose-500/30 text-rose-400'
            }`}>
              <span className="text-[11px] text-slate-300 block font-medium">Daily Net Result</span>
              <span className="text-base sm:text-lg font-black font-mono">
                {totalNet >= 0 ? '+' : ''}{currency}{totalNet.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          {/* Form to add or edit entry */}
          <form onSubmit={handleSubmit} className="bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-200">
                {editingEntryId ? 'Edit Trade Entry' : 'Add Trade on This Day'}
              </span>
              {editingEntryId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {/* Profit or Loss Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setIsProfit(true)}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                  isProfit
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Profit (+)</span>
              </button>
              <button
                type="button"
                onClick={() => setIsProfit(false)}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                  !isProfit
                    ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                <span>Loss (-)</span>
              </button>
            </div>

            {/* Amount & Charges Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  P/L Amount ({currency}) *
                </label>
                <div className="relative">
                  <span className={`absolute left-3 top-2.5 font-bold font-mono text-sm ${
                    isProfit ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {isProfit ? '+' : '-'}{currency}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="800.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Brokerage & Charges ({currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold font-mono text-sm text-slate-500">
                    {currency}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="15.00"
                    value={charges}
                    onChange={(e) => setCharges(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Symbol & Quick Pick */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-400">
                Stock / Instrument Symbol
              </label>
              <input
                type="text"
                placeholder="e.g. NIFTY, BANKNIFTY, RELIANCE"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-sm uppercase"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {QUICK_SYMBOLS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSymbol(s)}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Trade Type & Note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Trade Type
                </label>
                <select
                  value={tradeType}
                  onChange={(e) => setTradeType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500 text-sm"
                >
                  {TRADE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Strategy / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Breakout retest trade"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm"
                />
                <div className="flex flex-wrap gap-1 pt-1.5">
                  {QUICK_STRATEGIES.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setNote((prev) => prev ? `${prev}, ${tag}` : tag)}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
                    >
                      +{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Trade Quality Rating */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Trade Quality Rating</label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(rating === star ? 0 : star)}
                    className={`text-xl transition-all ${star <= rating ? 'text-amber-400' : 'text-slate-700 hover:text-amber-300'}`}
                  >
                    ★
                  </button>
                ))}
                {rating > 0 && (
                  <span className="text-[11px] text-amber-400 font-bold ml-1">{rating}/5</span>
                )}
              </div>
            </div>

            {/* Mood Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Trading Mood</label>
              <div className="flex flex-wrap gap-1.5">
                {MOODS.map((m) => (
                  <button
                    key={m.label}
                    type="button"
                    onClick={() => setMood(mood === `${m.emoji} ${m.label}` ? '' : `${m.emoji} ${m.label}`)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all ${
                      mood === `${m.emoji} ${m.label}`
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {m.emoji} {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Saving to database...</span>
              ) : editingEntryId ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Update Trade</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Save Trade to Calendar</span>
                </>
              )}
            </button>
          </form>

          {/* List of Entries on this day */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Logged Trades for {dateFormatted} ({entries.length})
              </h4>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                Net: {totalNet >= 0 ? '+' : ''}{currency}{totalNet.toFixed(2)}
              </span>
            </div>

            {entries.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
                No trades logged yet for {dateFormatted}. Enter amounts above to save and calculate daily and monthly totals.
              </div>
            ) : (
              <div className="space-y-2">
                {entries.map((entry) => {
                  const pnl = Number(entry.pnl_amount);
                  const chg = Number(entry.charges || 0);
                  const net = pnl - chg;
                  const isPos = net >= 0;

                  return (
                    <div
                      key={entry.id}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                            {entry.symbol || 'GENERAL'}
                          </span>
                          <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                            {entry.trade_type || 'Intraday'}
                          </span>
                        </div>
                        {entry.note && (
                          <p className="text-xs text-slate-400 italic">"{entry.note}"</p>
                        )}
                        <div className="text-[10px] text-slate-500 font-mono">
                          Gross: {pnl >= 0 ? '+' : ''}{currency}{pnl.toFixed(2)} | Charges: {currency}{chg.toFixed(2)}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className={`text-sm font-extrabold font-mono ${
                            isPos ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {isPos ? '+' : ''}{currency}{net.toFixed(2)}
                          </div>
                          <span className="text-[10px] text-slate-500">Net</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleStartEdit(entry)}
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-900 rounded-lg transition-colors"
                            title="Edit this entry"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors"
                            title="Delete this entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer with Done button */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
