# TradeCal — Stock Market Trading Calendar & P/L Tracker

A comprehensive, real-time trading journal and calendar application built with React, Vite, Tailwind CSS, FastAPI, and SQLite. Select any date on the calendar, log trades (profits/losses, charges, symbols, notes, mood, and star ratings), and automatically visualize performance with interactive charts, streak tracking, drawdown analysis, and position sizing tools.

---

## 🚀 Quick Start (Without Docker)

You can launch both the frontend and backend directly on your Windows machine with **one click**!

### Method 1: One-Click Launch (Recommended)
Double-click `tradecal/start.bat` in the project directory:
```powershell
.\tradecal\start.bat
```
This automatically starts:
1. **Backend API** at `http://127.0.0.1:8000` (Interactive API Docs: `http://127.0.0.1:8000/docs`)
2. **Frontend UI** at `http://localhost:5173`

---

### Method 2: Manual Start in Terminal

#### 1. Backend (FastAPI + Python)
```powershell
cd tradecal/backend
# Activate virtual environment
.\.venv\Scripts\activate
# Start FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Frontend (React + Vite + Tailwind CSS)
In a second terminal:
```powershell
cd tradecal/frontend
# Install dependencies (first time only)
npm install
# Start Vite development server
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🌟 Features & Highlights

1. **Interactive Trading Calendar**
   - Color-coded daily cells: **Green** for net profit days, **Red** for net loss days, and neutral for non-trading days.
   - Weekend indicators and official stock exchange holiday markers.
   - Shows daily net P/L, trade count badges, and brokerage fee deductions at a glance.

2. **Visual Charts & Pictorial Analytics**
   - **Equity Curve**: Cumulative growth graph tracking account equity over time.
   - **P/L Waterfall Bars**: Daily profit and loss bar comparison.
   - **Interactive Multi-Slice Pie Charts**: Visual breakdowns by trade type, win/loss ratio, and symbol distribution.
   - **Symbol Performance Bars**: Net P/L visualization by traded instrument.

3. **Risk Management & Position Sizing Calculator**
   - Calculate exact share/lot size based on account capital, risk percentage (e.g., 1-2%), entry price, stop-loss, and target.
   - Visual Risk-to-Reward (R:R) ratio bar.

4. **Streak & Drawdown Tracker**
   - Current and maximum win streaks & loss streaks.
   - Peak-to-trough maximum drawdown tracking with visual curve.

5. **Discipline & Rules Checklist**
   - Customizable pre-trade compliance checklist (e.g., "Wait for confirmation", "Never average a loser", "Adhere to stop-loss").
   - Daily adherence scoring with local persistence.

6. **Journal Log & Weekly Breakdown**
   - Searchable, filterable trade ledger table.
   - Week-by-week performance analysis and top symbols leaderboard.
   - Star ratings (1–5) and mood tracking (Confident, Disciplined, Fearful, Greedy, Neutral).

7. **Authentication & Multi-Currency**
   - Secure JWT token authentication with bcrypt password hashing.
   - Toggle between currencies (₹ / $).
   - One-click CSV export (`TradeCal_YYYY-MM.csv`).

---

## ⚙️ Tech Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS, Lucide Icons
- **Backend**: FastAPI, SQLAlchemy, Pydantic, Python-JOSE (JWT), Passlib (Bcrypt)
- **Database**: SQLite (Zero setup, out-of-the-box persistence) / MySQL ready

