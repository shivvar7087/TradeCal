import React from 'react';
import { Calendar, BarChart3, TrendingUp, LogIn, LogOut, Download, UserPlus, User as UserIcon, BookOpen, Calculator } from 'lucide-react';

export default function Navbar({
  user,
  isLoggedIn,
  currentView,
  setCurrentView,
  onOpenAuth,
  onLogout,
  onExportCSV,
  currency,
  setCurrency
}) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30 shadow-md shadow-slate-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-bold">
            <TrendingUp className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                TradeCal
              </span>
              <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Trading Calendar
              </span>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setCurrentView('calendar')}
            className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              currentView === 'calendar'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden md:inline">Calendar</span>
          </button>

          <button
            onClick={() => setCurrentView('journal')}
            className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              currentView === 'journal'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden md:inline">Journal Log</span>
          </button>

          <button
            onClick={() => setCurrentView('analytics')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              currentView === 'analytics'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden md:inline">Monthly Stats</span>
          </button>

          <button
            onClick={() => setCurrentView('yearly')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              currentView === 'yearly'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span className="hidden md:inline">Yearly View</span>
          </button>

          <button
            onClick={() => setCurrentView('tools')}
            className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              currentView === 'tools'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span className="hidden md:inline">Tools</span>
          </button>
        </nav>

        {/* Right Actions: Currency, Export, and Login/Logout */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Currency Toggle */}
          <button
            onClick={() => setCurrency(currency === '₹' ? '$' : '₹')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-colors"
            title="Toggle Currency Symbol"
          >
            {currency}
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCSV}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 transition-colors flex items-center space-x-1.5"
            title="Export Monthly Trades to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Auth State Buttons: Login or Logout */}
          {isLoggedIn ? (
            /* USER IS LOGGED IN -> SHOW PROFILE & LOG OUT BUTTON */
            <div className="flex items-center space-x-2">
              {/* User Profile Pill */}
              <div className="hidden lg:flex items-center space-x-2 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700/80">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-200 leading-tight">
                    {user?.name || 'Trader'}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight truncate max-w-[120px]">
                    {user?.email}
                  </div>
                </div>
              </div>

              {/* Explicit LOG OUT Button */}
              <button
                onClick={onLogout}
                className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-200 border border-rose-500/30 text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm shadow-rose-950/50"
                title="Log out of your account"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            /* USER IS NOT LOGGED IN -> SHOW PROMINENT LOG IN BUTTON */
            <div className="flex items-center space-x-1.5">
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center space-x-1.5"
                title="Sign in to your TradeCal account"
              >
                <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Log In</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
