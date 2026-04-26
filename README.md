# Financials 2.0

A personal finance tracker built on Google Sheets, Google Apps Script, and a mobile-first web app. Log transactions from your phone, track spending by category, monitor investments, and project your net worth — all in one place.

---

## What it does

- **Daily logging** — log expenses, income, and transfers from a mobile web app with offline support
- **Auto-archive** — entries move to a permanent archive at the end of each month automatically
- **Spending tracker** — weekly allowance tracking, category breakdowns, month-over-month comparison
- **Asset tracking** — log buys/sells with weighted average cost basis, live prices via GOOGLEFINANCE
- **Net worth projection** — conservative/moderate/aggressive scenarios to retirement
- **Tax estimation** — federal, NY State, and NYC bracket calculations with W-4 targets
- **Dashboard** — KPI cards, spending donut, year-over-year charts

---

## How it works

```
GitHub Pages (this repo)          Google Apps Script
──────────────────────            ──────────────────────────────
index.html (web app UI)    ←───→  Code.gs (reads/writes Sheet)
service-worker.js                 Your Google Sheet (your data)
manifest.json
```

The web app lives here on GitHub and loads offline via service worker. It calls **your own** Apps Script deployment to read and write your private Google Sheet. Your data never touches any external server — it goes directly between your browser and your Sheet.

---

## Setup (new user)

### Step 1 — Copy the Google Sheet template

Make a copy of the template sheet:
👉 **[Make a copy](https://docs.google.com/spreadsheets/d/1EUTDCNJ-Z12aTgzW2lfmYlYY9zWpEgWZ9HJSbOGDrBU/copy)**

### Step 2 — Set up Apps Script

1. In your copied Sheet, go to **Extensions → Apps Script**
2. Delete any existing code and paste the contents of [`Code.gs`](Code.gs)
3. Click the **+** next to Files and create a new HTML file named `Index` — paste the contents of [`index.html`](index.html)
4. Create another HTML file named `Sidebar` — paste the contents of [`Sidebar.html`](Sidebar.html)
5. Save all files (Ctrl/Cmd + S)

### Step 3 — Deploy as a web app

1. Click **Deploy → New Deployment**
2. Click the gear icon → **Web App**
3. Set **Execute as: Me**
4. Set **Who has access: Only myself**
5. Click **Deploy** and copy the URL that appears

### Step 4 — Connect the web app

1. Open **[quanhanli-sys.github.io/Personal-Finance-Tracker](https://quanhanli-sys.github.io/Personal-Finance-Tracker)** on your phone
2. Paste your Apps Script URL into the connection screen
3. Tap **Connect**

### Step 5 — Run first-time setup

1. In your Google Sheet, go to **Financials → Setup Wizard (new user)**
2. Fill in your salary, fixed expenses, and savings goals
3. Click Submit

### Step 6 — Final wiring

Back in your Sheet:
1. **Financials → Install Auto-Sync** — run once (enables salary updates)
2. **Financials → Setup Tax Bracket Highlighting** — run once
3. **Financials → Fix Dashboard #REF! Errors** — run once after setup
4. **Apps Script → Triggers** → add a new trigger:
   - Function: `archiveIfNewMonth`
   - Event: Time-driven → Day timer → Between 1am and 2am

### Step 7 — Add to home screen (iPhone)

Open the app in Safari → Share button → **Add to Home Screen**. The app installs like a native app with a home screen icon and loads offline.

---

## Daily use

**Logging a transaction:**
Open the app → type the amount → select category → tap Save. The entry queues locally and syncs to your Sheet automatically.

**Works offline:**
The app loads from cache when offline. Entries save to a local queue and sync automatically when your connection returns.

**Logging assets:**
Tap the Assets tab → select BUY or SELL → enter amount or shares. Live price is fetched automatically from your Sheet's GOOGLEFINANCE formulas.

---

## Sheet tabs

| Tab | Purpose |
|-----|---------|
| Dashboard | KPI cards and charts — your financial snapshot |
| Input Hub | Single source of truth — all your settings live here |
| Tracker | Weekly spend, savings goals, year-by-year monthly totals |
| Expenditure Log | Active current-month transactions |
| Expenditure Archive | All past months — permanent record |
| Paycheck & Monthly | Paycheck breakdown and monthly budget |
| Assets | Live portfolio — prices, cost basis, growth |
| Purchase Log | Every trade — buys, sells, backfills |
| Projection | Net worth trajectory to end of life |
| Tax & Settings | Tax brackets, withholding estimates, salary history |

---

## Financials menu (in your Sheet)

| Menu item | When to use |
|-----------|-------------|
| Log Entry (sheet row) | Enter a transaction directly from the sheet |
| Archive Current Month | Manually move log entries to archive |
| Fix Dashboard #REF! Errors | Run if charts show errors after deployment |
| Rewrite Live Tracker Formulas | Run if Tracker shows #REF! or #N/A |
| Rebuild Charts | Run if year-over-year chart data is missing |
| Sync Tracker Year Blocks | Run after changing "Tracker years ahead" |
| Install Auto-Sync | Run once on setup |
| Run Year Rollover | Run manually if Jan 1 auto-rollover failed |
| Take Portfolio Snapshot | Capture portfolio value at any point |
| Setup Wizard (new user) | First-time setup |
| Setup Input Hub | Rebuild Input Hub from current values |

---

## Updating

**Web app updates** (UI changes, new features) — automatic. The app loads the latest version from GitHub on every open.

**Code.gs updates** (new server functions, bug fixes):
1. Open Apps Script in your Sheet
2. Replace the contents of `Code.gs` with the latest version from this repo
3. Click **Deploy → Manage Deployments → Edit (pencil) → New version → Deploy**

The current version is noted at the top of `Code.gs` as `CODE_VERSION`.

---

## Privacy

Your financial data never leaves your own Google ecosystem. The web app (hosted here on GitHub) is a static front-end with no server, no database, and no analytics. All data reads and writes go directly from your browser to your own Google Sheet via your own Apps Script deployment.

---

## Tech stack

- **Front-end:** Vanilla JS, HTML/CSS — no frameworks
- **Backend:** Google Apps Script (serverless, runs as you)
- **Database:** Google Sheets
- **Hosting:** GitHub Pages (this repo)
- **Offline:** Service Worker + localStorage queue
- **Prices:** GOOGLEFINANCE (built into Sheets)

---

## Code version

`CODE_VERSION = "2.1.0"` — see `Code.gs` header for changelog.
