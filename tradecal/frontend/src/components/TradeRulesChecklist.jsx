import React, { useState, useMemo } from 'react';
import { ListChecks, Plus, X, CheckCircle2, Circle, RefreshCw } from 'lucide-react';

const DEFAULT_RULES = [
  'Wait for market open confirmation (9:30 AM)',
  'Check overall Nifty/index trend first',
  'Risk max 1% of capital per trade',
  'Do NOT revenge trade after a loss',
  'Stop trading after 3 consecutive losses',
  'Trade only in the direction of the trend',
  'Set stop loss BEFORE entering the trade',
];

export default function TradeRulesChecklist() {
  const todayStr = new Date().toISOString().split('T')[0];
  const rulesKey = 'tradecal_rules';
  const checkKey = `tradecal_checklist_${todayStr}`;

  const [rules, setRules] = useState(() => {
    try {
      const saved = localStorage.getItem(rulesKey);
      return saved ? JSON.parse(saved) : DEFAULT_RULES;
    } catch { return DEFAULT_RULES; }
  });

  const [checked, setChecked] = useState(() => {
    try {
      const saved = localStorage.getItem(checkKey);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const [newRule, setNewRule] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const saveRules = (updatedRules) => {
    setRules(updatedRules);
    localStorage.setItem(rulesKey, JSON.stringify(updatedRules));
  };

  const toggleCheck = (idx) => {
    const updated = { ...checked, [idx]: !checked[idx] };
    setChecked(updated);
    localStorage.setItem(checkKey, JSON.stringify(updated));
  };

  const addRule = () => {
    const trimmed = newRule.trim();
    if (!trimmed) return;
    saveRules([...rules, trimmed]);
    setNewRule('');
  };

  const removeRule = (idx) => {
    const updated = rules.filter((_, i) => i !== idx);
    // Remap checked indices
    const newChecked = {};
    updated.forEach((_, newIdx) => {
      const oldIdx = rules.findIndex((r, i) => i !== idx && rules.indexOf(r) === i);
      // Simple: just clear checked for simplicity when deleting
    });
    saveRules(updated);
    setChecked({});
    localStorage.removeItem(checkKey);
  };

  const resetToday = () => {
    setChecked({});
    localStorage.removeItem(checkKey);
  };

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const total = rules.length;
  const pct = total > 0 ? Math.round((checkedCount / total) * 100) : 0;
  const scoreColor = pct >= 80 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-rose-400';
  const barColor = pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl shadow-slate-950/50 mb-6 overflow-hidden">
      {/* Header — clickable to collapse */}
      <div
        className="flex items-center justify-between p-5 sm:p-6 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <ListChecks className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Pre-Trade Rules Checklist
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Follow your rules daily to build trading discipline — {todayStr}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className={`text-lg font-black font-mono ${scoreColor}`}>{pct}%</div>
            <div className="text-[10px] text-slate-500">{checkedCount}/{total} rules</div>
          </div>
          <span className={`text-slate-400 text-sm transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </div>

      {/* Progress Bar — always visible */}
      <div className="px-5 sm:px-6 pb-3">
        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            style={{ width: `${pct}%` }}
            className={`h-full ${barColor} transition-all duration-500 rounded-full`}
          />
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-3">
          {/* Rules list */}
          <div className="space-y-1.5">
            {rules.map((rule, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all ${
                  checked[idx]
                    ? 'bg-emerald-950/30 border-emerald-500/30'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <button
                    onClick={() => toggleCheck(idx)}
                    className="flex-shrink-0 transition-transform active:scale-90"
                  >
                    {checked[idx] ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                    )}
                  </button>
                  <span className={`text-xs font-medium truncate ${
                    checked[idx] ? 'text-emerald-300 line-through decoration-emerald-500/50' : 'text-slate-200'
                  }`}>
                    {rule}
                  </span>
                </div>

                <button
                  onClick={() => removeRule(idx)}
                  className="ml-2 p-1 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex-shrink-0"
                  title="Remove rule"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add new rule */}
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="text"
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addRule()}
              placeholder="Add a new trading rule..."
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500"
            />
            <button
              onClick={addRule}
              disabled={!newRule.trim()}
              className="p-2 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 border border-violet-500/30 disabled:opacity-40 transition-colors"
              title="Add rule"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={resetToday}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 transition-colors"
              title="Reset today's checklist"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Score Summary */}
          {checkedCount === total && total > 0 && (
            <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-center text-sm font-bold text-emerald-400 animate-pulse">
              🎯 Perfect Discipline Score Today! All rules followed!
            </div>
          )}
        </div>
      )}
    </div>
  );
}

