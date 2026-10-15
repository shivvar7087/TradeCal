import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, Edit3, Check, X, Award, Flame } from 'lucide-react';

export default function MonthlyTargetTracker({ currentMonth, netPnl = 0, currency = '₹' }) {
  const storageKey = `tradecal_target_${currentMonth}`;
  
  const [targetAmount, setTargetAmount] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? parseFloat(saved) : 25000;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [inputVal, setInputVal] = useState(targetAmount.toString());

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    const val = saved ? parseFloat(saved) : 25000;
    setTargetAmount(val);
    setInputVal(val.toString());
    setIsEditing(false);
  }, [currentMonth, storageKey]);

  const handleSave = (e) => {
    e.preventDefault();
    const parsed = parseFloat(inputVal);
    if (!isNaN(parsed) && parsed > 0) {
      setTargetAmount(parsed);
      localStorage.setItem(storageKey, parsed.toString());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setInputVal(targetAmount.toString());
    setIsEditing(false);
  };

  // Calculations
  const progressPercent = targetAmount > 0 
    ? Math.max(0, Math.min(100, Math.round((netPnl / targetAmount) * 100))) 
    : 0;

  const rawPercent = targetAmount > 0 
    ? ((netPnl / targetAmount) * 100).toFixed(1) 
    : '0.0';

  const remaining = Math.max(0, targetAmount - netPnl);
  const isGoalReached = netPnl >= targetAmount && targetAmount > 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-950/50 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30">
            <Target className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Monthly Profit Target & Goal Tracker
              </h3>
              {isGoalReached && (
                <span className="flex items-center space-x-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                  <Award className="w-3 h-3" />
                  <span>Target Hit! 🎉</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Set your target for this month and monitor your real-time execution progress
            </p>
          </div>
        </div>

        {/* Target Edit Action */}
        <div>
          {isEditing ? (
            <form onSubmit={handleSave} className="flex items-center space-x-2">
              <div className="relative">
                <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-mono font-bold">
                  {currency}
                </span>
                <input
                  type="number"
                  min="1"
                  step="100"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="w-32 pl-7 pr-2.5 py-1 text-xs font-mono font-bold bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="p-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold transition-colors"
                title="Save Target"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700/80 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Edit Goal ({currency}{targetAmount.toLocaleString('en-IN')})</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Metrics & Bar */}
      <div className="pt-4 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-baseline space-x-2">
            <span className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${
              netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {netPnl >= 0 ? '+' : ''}{currency}{netPnl.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-400">
              achieved of <span className="font-bold text-slate-200">{currency}{targetAmount.toLocaleString('en-IN')}</span> goal
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className={`font-bold ${netPnl >= targetAmount ? 'text-emerald-400' : 'text-amber-400'}`}>
              {rawPercent}% Done
            </span>
            {remaining > 0 && (
              <span className="text-slate-400">
                Remaining: <span className="text-slate-200 font-bold">{currency}{remaining.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </span>
            )}
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 flex">
          <div
            style={{ width: `${progressPercent}%` }}
            className={`h-full rounded-full transition-all duration-700 ${
              isGoalReached
                ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 shadow-md shadow-emerald-500/50'
                : netPnl >= 0
                ? 'bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-400'
                : 'bg-rose-500/40'
            }`}
          />
        </div>
      </div>
    </div>
  );
}

