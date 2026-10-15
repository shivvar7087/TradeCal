# TradeCal — Stock Market Trading Calendar & P/L Tracker

A dedicated daily trading journal that looks and calculates just like the stock market. Select any date on the calendar, enter profit or loss numbers, and automatically compute your daily totals, monthly net totals, win rates, and annual statistics with persistent database storage.

---

## 🚀 Quick Start (Without Docker)

You can launch both the frontend and backend directly on your Windows machine with **one click**!

### Method 1: One-Click Launch (Recommended)
Double-click `start.bat` in the project root:
```powershell
e:\calender\tradecal\start.bat
```
This automatically starts:
1. **Backend API** at `http://127.0.0.1:8000` (Swagger Docs: `http://127.0.0.1:8000/docs`)
2. **Frontend UI** at `http://localhost:5173`

---

### Method 2: Manual Start in Terminal

#### 1. Backend (FastAPI + Python)
```powershell
cd e:\calender\tradecal\backend
# Activate virtual environment
.\.venv\Scripts\activate
# Start FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Frontend (React + Vite + Tailwind CSS)
In a second terminal window:
```powershell
cd e:\calender\tradecal\frontend
# Start Vite development server
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## ⚙️ Database Configuration

By default, the project runs on **SQLite** (`tradecal.db`), which requires **zero configuration or server setup**—everything works immediately out-of-the-box!

If you wish to switch to your local **MySQL** server:
1. Open `e:\calender\tradecal\backend\.env`
2. Change `DB_TYPE=sqlite` to:
   ```env
   DB_TYPE=mysql
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_DATABASE=tradecal_db
   MYSQL_USER=root
   MYSQL_PASSWORD=your_mysql_password
   ```
3. Restart the backend. SQLAlchemy automatically creates all necessary tables on startup!

---

## 🌟 Key Features

1. **Stock Market Calendar Grid**
   - Color-coded daily cells: **Green** for daily net profit, **Red** for daily net loss, and neutral for untraded days.
   - Weekend indicators and pre-seeded official Exchange Market Holidays (NSE / BSE).
   - Shows daily net P/L amount, trade count badge, and fee deductions at a glance.

2. **Automatic Daily & Monthly Aggregations**
   - Computes Net P/L using the formula:
     $$\text{Net P/L} = \sum (\text{P/L Amount} - \text{Charges})$$
   - Instant live updates whenever an entry is added, modified, or deleted.

3. **Performance Dashboard & KPI Cards**
   - **Monthly Net P/L**
   - **Winning Days** vs. **Losing Days**
   - **Win Rate %**
   - **Total Charges & Brokerage Paid**
   - **Daily P/L Distribution Chart** (visual bars for each day in the month)
   - **Best Day & Worst Day** highlights

4. **12-Month Yearly Overview**
   - View your annual net profit/loss, total trades, and monthly breakdowns with 1-click calendar navigation.

5. **Trade Details & Journaling**
   - Record Stock/Instrument symbol (NIFTY, BANKNIFTY, RELIANCE, TSLA, etc.)
   - Trade Type (Intraday, Options, Futures, Delivery, Crypto)
   - Trade Notes & Strategy remarks
   - Full CSV Export capability (`TradeCal_YYYY-MM.csv`)

6. **Authentication & Instant Demo**
   - Secure password hashing (bcrypt) and JWT authentication.
   - Includes a **1-Click Instant Demo Login** so you can test right away without registering manually.

## Deployment

The repository includes deployment configuration for Netlify and Render:

- `netlify.toml` builds the Vite frontend from `frontend` and enables SPA
  fallback routing.
- `render.yaml` deploys the FastAPI backend and provisions a managed PostgreSQL
  database.

### Render backend

1. Create a new Blueprint on Render from this repository and select
   `render.yaml`.
2. Set `CORS_ORIGINS` to the final Netlify URL, for example
   `https://your-site.netlify.app`.
3. After the API deploys, copy its public URL, such as
   `https://tradecal-api.onrender.com`.

### Netlify frontend

1. Create a new site on Netlify from this repository. The included
   `netlify.toml` supplies the build settings.
2. Add `VITE_API_URL` with the Render API URL without a trailing slash.
3. Deploy or trigger a new build after saving the variable.

Local environment templates are available at `backend/.env.example` and
`frontend/.env.example`. Never commit real `.env` files or production secrets.
