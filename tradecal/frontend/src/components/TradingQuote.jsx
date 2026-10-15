import React, { useState } from 'react';
import { Lightbulb, RefreshCw } from 'lucide-react';

const QUOTES = [
  { text: "The most important quality for an investor is temperament, not intellect.", author: "Warren Buffett" },
  { text: "The stock market is a device for transferring money from the impatient to the patient.", author: "Warren Buffett" },
  { text: "In trading, the one who survives is rarely the one who is always right.", author: "Ed Seykota" },
  { text: "Cut your losses short and let your profits run.", author: "Jesse Livermore" },
  { text: "The market is not your enemy. Your own emotions are.", author: "Mark Douglas" },
  { text: "Risk management is the most important thing in trading. It is more important than being right.", author: "Paul Tudor Jones" },
  { text: "Do not focus on making money; focus on protecting what you have.", author: "Paul Tudor Jones" },
  { text: "Every trader has strengths and weaknesses. Some are good holders of winners, but may hold their losers a little too long.", author: "Steve Cohen" },
  { text: "The goal of a successful trader is to make the best trades. Money is secondary.", author: "Alexander Elder" },
  { text: "In trading you have to be defensive and aggressive at the same time.", author: "Ray Dalio" },
  { text: "Don't confuse luck with skill. The market will eventually teach you the difference.", author: "Anonymous Trader" },
  { text: "Trade what you see, not what you think.", author: "Jesse Livermore" },
  { text: "The secret to trading is that there is no secret — just hard work, discipline and patience.", author: "Mark Minervini" },
  { text: "Plan the trade, trade the plan.", author: "Trading Axiom" },
  { text: "Your job as a trader is not to be right — it's to manage risk.", author: "Anonymous" },
  { text: "Amateurs focus on profits. Professionals focus on risk.", author: "Anonymous Trader" },
  { text: "A good trader is not someone who is always right. A good trader is someone who keeps losses small.", author: "Anonymous" },
  { text: "The market rewards patience. The market punishes impatience.", author: "Anonymous Trader" },
  { text: "If you can't take a small loss, sooner or later you will take the mother of all losses.", author: "Ed Seykota" },
  { text: "Be fearful when others are greedy and greedy when others are fearful.", author: "Warren Buffett" },
];

function todayQuoteIndex() {
  const d = new Date();
  return (d.getFullYear() * 1000 + d.getMonth() * 31 + d.getDate()) % QUOTES.length;
}

export default function TradingQuote() {
  const [idx, setIdx] = useState(todayQuoteIndex());
  const quote = QUOTES[idx];

  const nextQuote = () => setIdx((prev) => (prev + 1) % QUOTES.length);

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/30 border border-indigo-500/20 rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-950/50 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start space-x-3 flex-1">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex-shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-2">
              Trader's Mindset — Daily Quote
            </div>
            <blockquote className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed italic">
              "{quote.text}"
            </blockquote>
            <div className="text-xs text-slate-400 mt-2 font-medium">
              — {quote.author}
            </div>
          </div>
        </div>
        <button
          onClick={nextQuote}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors flex-shrink-0"
          title="Next Quote"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

