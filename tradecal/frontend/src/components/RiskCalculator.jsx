import React, { useState } from 'react';
import { Calculator, Shield, Target, TrendingUp, AlertTriangle, Zap } from 'lucide-react';

const RISK_PRESETS = [0.5, 1, 1.5, 2, 3];

export default function RiskCalculator({ currency = '₹' }) {
  const [capital, setCapital] = useState('100000');
  const [riskPct, setRiskPct] = useState('1');
  const [entryPrice, setEntryPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [targetPrice, setTargetPrice] = useState('');

  const cap = parseFloat(capital) || 0;
  const risk = parseFloat(riskPct) || 0;
  const entry = parseFloat(entryPrice) || 0;
  const sl = parseFloat(stopLoss) || 0;
  const tp = parseFloat(targetPrice) || 0;

  // Calculations
  const riskAmount = cap * (risk / 100);
  const slDistance = entry > 0 && sl > 0 ? Math.abs(entry - sl) : 0;
  const tpDistance = entry > 0 && tp > 0 ? Math.abs(tp - entry) : 0;
  const quantity = slDistance > 0 ? Math.floor(riskAmount / slDistance) : 0;
  const potentialProfit = quantity * tpDistance;
  const maxLoss = quantity * slDistance;
  const rrRatio = slDistance > 0 ? tpDistance / slDistance : 0;
  const breakevenPct = tpDistance > 0 ? (slDistance / tpDistance) * 100 : 0;

  const rrColor = rrRatio >= 2 ? 'text-emerald-400' : rrRatio >= 1 ? 'text-amber-400' : 'text-rose-400';
  const rrBorderColor = rrRatio >= 2 ? 'border-emerald-500/40' : rrRatio >= 1 ? 'border-amber-500/40' : 'border-rose-500/40';
  const rewardBarPct = rrRatio > 0 ? Math.min(80, (rrRatio / (rrRatio + 1)) * 100) : 50;
  const riskBarPct = 100 - rewardBarPct;

  const fmt = (n) => Math.round(n).toLocaleString('en-IN');
  const fmt2 = (n) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-950/50 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Position Sizing & Risk Calculator
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Calculate optimal trade size based on your risk tolerance
            </p>
          </div>
        </div>
        <span className="hidden sm:block text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          Risk Management
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Inputs */}
        <div className="space-y-4">
          {/* Capital & Risk Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Account Capital ({currency})
              </label>
              <input
                type="number"
                min="1"
                value={capital}
                onChange={(e) => setCapital(e.target.value)}
                placeholder="100000"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Risk % per Trade
              </label>
              <input
                type="number"
                min="0.1"
                max="10"
                step="0.1"
                value={riskPct}
                onChange={(e) => setRiskPct(e.target.value)}
                placeholder="1.5"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm font-mono"
              />
              {/* Quick Risk Presets */}
              <div className="flex items-center space-x-1 mt-1.5">
                {RISK_PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setRiskPct(String(p))}
                    className={`flex-1 text-[9px] font-bold py-0.5 rounded-lg border transition-all ${
                      parseFloat(riskPct) === p
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                        : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Entry / Stop Loss / Target */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Entry Price
              </label>
              <input
                type="number"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                placeholder="18500"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider flex items-center space-x-1">
                <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                <span>Stop Loss</span>
              </label>
              <input
                type="number"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                placeholder="18200"
                className="w-full px-3 py-2 bg-slate-950 border border-rose-500/30 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider flex items-center space-x-1">
                <Target className="w-2.5 h-2.5 text-emerald-400" />
                <span>Target</span>
              </label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="19000"
                className="w-full px-3 py-2 bg-slate-950 border border-emerald-500/30 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm font-mono"
              />
            </div>
          </div>

          {/* Risk:Reward Visualization Bar */}
          {rrRatio > 0 && (
            <div className={`p-3.5 rounded-2xl border ${rrBorderColor} bg-slate-950/70`}>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-rose-400 font-semibold">Risk</span>
                <span className={`font-black font-mono text-base ${rrColor}`}>
                  1 : {rrRatio.toFixed(2)} R:R
                </span>
                <span className="text-emerald-400 font-semibold">Reward</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${riskBarPct}%` }}
                  className="bg-rose-500/60 border-r-2 border-rose-400 transition-all"
                />
                <div
                  style={{ width: `${rewardBarPct}%` }}
                  className="bg-emerald-500/60 transition-all"
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>SL: {slDistance > 0 ? fmt2(slDistance) : '—'} pts</span>
                <span>Target: {tpDistance > 0 ? fmt2(tpDistance) : '—'} pts</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Calculated Results */}
        <div className="grid grid-cols-2 gap-3 content-start">
          {/* Risk Amount */}
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <div className="flex items-center space-x-1.5 mb-1">
              <Shield className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Max Risk</span>
            </div>
            <div className="text-lg font-extrabold font-mono text-rose-400">
              {currency}{fmt(riskAmount)}
            </div>
            <div className="text-[10px] text-slate-500">{risk}% of capital</div>
          </div>

          {/* Quantity */}
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <div className="flex items-center space-x-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Quantity</span>
            </div>
            <div className="text-lg font-extrabold font-mono text-indigo-400">
              {quantity > 0 ? quantity.toLocaleString('en-IN') : '—'}
            </div>
            <div className="text-[10px] text-slate-500">shares / lots</div>
          </div>

          {/* Potential Profit */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center space-x-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Potential Profit</span>
            </div>
            <div className="text-lg font-extrabold font-mono text-emerald-400">
              {potentialProfit > 0 ? `${currency}${fmt(potentialProfit)}` : '—'}
            </div>
            <div className="text-[10px] text-slate-500">at target price</div>
          </div>

          {/* R:R Ratio */}
          <div className={`p-3.5 rounded-2xl border ${rrBorderColor} bg-slate-950/70`}>
            <div className="flex items-center space-x-1.5 mb-1">
              <Target className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">R:R Ratio</span>
            </div>
            <div className={`text-lg font-extrabold font-mono ${rrColor}`}>
              {rrRatio > 0 ? `1 : ${rrRatio.toFixed(2)}` : '—'}
            </div>
            <div className="text-[10px] text-slate-500">
              {rrRatio >= 2 ? '✅ Good setup' : rrRatio >= 1 ? '⚠️ Marginal' : rrRatio > 0 ? '❌ Bad R:R' : 'Enter prices'}
            </div>
          </div>

          {/* Breakeven % */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Breakeven Move
            </span>
            <div className="text-lg font-extrabold font-mono text-amber-400">
              {breakevenPct > 0 ? `${breakevenPct.toFixed(1)}%` : '—'}
            </div>
            <div className="text-[10px] text-slate-500">of target distance</div>
          </div>

          {/* Confirmed Max Loss */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Capital at Risk
            </span>
            <div className="text-lg font-extrabold font-mono text-rose-400">
              {maxLoss > 0 ? `${currency}${fmt(maxLoss)}` : '—'}
            </div>
            <div className="text-[10px] text-slate-500">if SL is hit</div>
          </div>
        </div>
      </div>
    </div>
  );
}

