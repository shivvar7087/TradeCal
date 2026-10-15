import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import SummaryCards from './components/SummaryCards';
import TradingCalendar from './components/TradingCalendar';
import EntryModal from './components/EntryModal';
import MonthlyChart from './components/MonthlyChart';
import YearlyView from './components/YearlyView';
import AuthModal from './components/AuthModal';
import VisualCharts from './components/VisualCharts';
import MonthlyTargetTracker from './components/MonthlyTargetTracker';
import JournalView from './components/JournalView';
import RiskCalculator from './components/RiskCalculator';
import StreakTracker from './components/StreakTracker';
import TradeRulesChecklist from './components/TradeRulesChecklist';
import WeeklyBreakdown from './components/WeeklyBreakdown';
import TopSymbolsLeaderboard from './components/TopSymbolsLeaderboard';
import TradingQuote from './components/TradingQuote';
import { api } from './api/client';
import { RefreshCw, PlusCircle, AlertCircle, LineChart } from 'lucide-react';

export default function App() {
  // Current date initialization
  const now = new Date();
  const initialMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const initialYear = now.getFullYear();

  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [currentView, setCurrentView] = useState('calendar'); // 'calendar' | 'analytics' | 'yearly'
  const [currency, setCurrency] = useState('₹');
  const [showChartOnCalendar, setShowChartOnCalendar] = useState(true);

  // User auth state
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem('tradecal_token')));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tradecal_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Data states
  const [calendarData, setCalendarData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [yearlyData, setYearlyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Entry modal states
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDayData, setSelectedDayData] = useState(null);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

  // Load user profile on mount (seamless local journal or authenticated user)
  useEffect(() => {
    async function loadUser() {
      setIsLoggedIn(Boolean(localStorage.getItem('tradecal_token')));
      try {
        const me = await api.getMe();
        if (me) setUser(me);
      } catch (err) {
        // Unauthenticated or offline: backend automatically defaults to local journal
      }
    }
    loadUser();
  }, []);

  // Fetch month calendar and monthly analytics
  const fetchMonthData = useCallback(async (monthStr) => {
    setLoading(true);
    setError(null);
    try {
      const [cal, anal] = await Promise.all([
        api.getCalendar(monthStr),
        api.getMonthlyAnalytics(monthStr),
      ]);
      setCalendarData(cal);
      setAnalyticsData(anal);

      // If entry modal is open for a date, refresh selectedDayData
      if (selectedDate && cal) {
        const found = cal.days.find((d) => d.entry_date === selectedDate);
        if (found) setSelectedDayData(found);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch calendar data');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Fetch yearly analytics
  const fetchYearlyData = useCallback(async (yearNum) => {
    try {
      const yData = await api.getYearlyAnalytics(yearNum);
      setYearlyData(yData);
    } catch (err) {
      console.error('Yearly data error:', err);
    }
  }, []);

  // Reload data on month/year changes or user changes
  useEffect(() => {
    fetchMonthData(currentMonth);
    fetchYearlyData(currentYear);
  }, [currentMonth, currentYear, user, fetchMonthData, fetchYearlyData]);

  // Navigation handlers
  const handlePrevMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const newMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(newMonth);
  };

  const handleNextMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    const newMonth = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(newMonth);
  };

  const handleToday = () => {
    const today = new Date();
    const todayMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(todayMonth);
  };

  // Day click -> open entry modal
  const handleSelectDate = (dateStr, dayData) => {
    setSelectedDate(dateStr);
    setSelectedDayData(dayData);
    setIsEntryModalOpen(true);
  };

  // Quick entry for today
  const handleAddToday = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const dayData = calendarData?.days?.find((d) => d.entry_date === todayStr);
    handleSelectDate(todayStr, dayData || { entry_date: todayStr, entries: [], net_pnl: 0 });
  };

  const handleEntriesChanged = async (changedDateStr) => {
    let monthToFetch = currentMonth;
    if (changedDateStr) {
      const entryMonth = changedDateStr.slice(0, 7);
      if (entryMonth !== currentMonth) {
        monthToFetch = entryMonth;
        setCurrentMonth(entryMonth);
      }
    }
    await Promise.all([
      fetchMonthData(monthToFetch),
      fetchYearlyData(currentYear),
    ]);
  };

  const handleLogout = async () => {
    api.logout();
    setIsLoggedIn(false);
    try {
      const me = await api.getMe();
      setUser(me);
    } catch {
      setUser({ name: 'My Trading Journal', email: 'trader@local.app' });
    }
    fetchMonthData(currentMonth);
    fetchYearlyData(currentYear);
  };

  // Export CSV
  const handleExportCSV = async () => {
    try {
      const entries = await api.getEntries(currentMonth);
      if (!entries || entries.length === 0) {
        alert('No entries to export for this month.');
        return;
      }
      const headers = ['ID', 'Date', 'Symbol', 'Trade Type', 'P/L Amount', 'Charges', 'Net P/L', 'Notes'];
      const rows = entries.map((e) => [
        e.id,
        e.entry_date,
        e.symbol || '',
        e.trade_type || '',
        e.pnl_amount,
        e.charges,
        (Number(e.pnl_amount) - Number(e.charges)).toFixed(2),
        `"${(e.note || '').replace(/"/g, '""')}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `TradeCal_${currentMonth}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Error exporting CSV: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        user={user}
        isLoggedIn={isLoggedIn}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onExportCSV={handleExportCSV}
        currency={currency}
        setCurrency={setCurrency}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Action Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Stock Market Trading Journal & Calendar
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Select any date on the calendar to record your daily profits, losses, and charges.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Toggle Graph on Calendar View */}
            {currentView === 'calendar' && (
              <button
                onClick={() => setShowChartOnCalendar(!showChartOnCalendar)}
                className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  showChartOnCalendar
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
                }`}
                title="Toggle Pictorial Charts & Graphs"
              >
                <LineChart className="w-4 h-4" />
                <span className="hidden sm:inline">{showChartOnCalendar ? 'Hide Graph' : 'Show Graph'}</span>
              </button>
            )}

            <button
              onClick={() => fetchMonthData(currentMonth)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            <button
              onClick={handleAddToday}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Trade for Today</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchMonthData(currentMonth)}
              className="text-xs font-bold underline ml-4 hover:text-rose-300"
            >
              Retry
            </button>
          </div>
        )}

        {/* Daily Trading Quote — always visible */}
        <TradingQuote />

        {/* Monthly Performance KPI Cards */}
        <SummaryCards data={analyticsData} currency={currency} />

        {/* Monthly Target Goal Tracker */}
        <MonthlyTargetTracker
          currentMonth={currentMonth}
          netPnl={analyticsData?.net_pnl || 0}
          currency={currency}
        />

        {/* Pre-trade Rules Checklist — always visible */}
        <TradeRulesChecklist />

        {/* View Content */}
        {currentView === 'calendar' && (
          <>
            {/* Pictorial Graph directly above Calendar */}
            {showChartOnCalendar && (
              <VisualCharts
                calendarData={calendarData}
                analytics={analyticsData}
                currency={currency}
              />
            )}

            {/* Streak Tracker + Drawdown curve */}
            <StreakTracker
              calendarData={calendarData}
              analytics={analyticsData}
              currency={currency}
            />

            <TradingCalendar
              currentMonth={currentMonth}
              calendarData={calendarData}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onToday={handleToday}
              onSelectDate={handleSelectDate}
              currency={currency}
            />
          </>
        )}

        {currentView === 'journal' && (
          <JournalView
            calendarData={calendarData}
            onOpenEntryModal={(dStr) => {
              const found = calendarData?.days?.find((d) => d.entry_date === dStr);
              handleSelectDate(dStr, found || { entry_date: dStr, entries: [], net_pnl: 0 });
            }}
            onEntriesChanged={handleEntriesChanged}
            currency={currency}
          />
        )}

        {currentView === 'analytics' && (
          <>
            <MonthlyChart
              analytics={analyticsData}
              calendarData={calendarData}
              currency={currency}
            />
            <WeeklyBreakdown
              calendarData={calendarData}
              currency={currency}
            />
            <TopSymbolsLeaderboard
              calendarData={calendarData}
              currency={currency}
            />
            <StreakTracker
              calendarData={calendarData}
              analytics={analyticsData}
              currency={currency}
            />
          </>
        )}

        {currentView === 'yearly' && (
          <YearlyView
            year={currentYear}
            onYearChange={(y) => setCurrentYear(y)}
            yearlyData={yearlyData}
            onSelectMonth={(mStr) => {
              setCurrentMonth(mStr);
              setCurrentView('calendar');
            }}
            currency={currency}
          />
        )}

        {currentView === 'tools' && (
          <div className="space-y-6">
            <div className="text-center py-2">
              <h2 className="text-xl font-bold text-white">Trading Tools</h2>
              <p className="text-xs text-slate-400 mt-1">Position sizing, risk management & pre-trade calculators</p>
            </div>
            <RiskCalculator currency={currency} />
          </div>
        )}
      </main>

      {/* Trade Entry Modal */}
      {isEntryModalOpen && selectedDate && (
        <EntryModal
          dateStr={selectedDate}
          dayData={selectedDayData}
          onClose={() => setIsEntryModalOpen(false)}
          onEntriesChanged={handleEntriesChanged}
          currency={currency}
        />
      )}

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={(u) => {
            setIsLoggedIn(true);
            setUser(u);
            fetchMonthData(currentMonth);
            fetchYearlyData(currentYear);
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        TradeCal — Stock Market Trading Calendar & P/L Tracker • Running locally without Docker
      </footer>
    </div>
  );
}

