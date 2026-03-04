# GoldINR Tracker — Application Specification

## Overview

A Next.js fullstack web application for Indian investors to track US Gold ETF prices alongside the USD/INR exchange rate. The key value is a combined INR-adjusted performance metric that shows what an Indian investor's US gold holdings are actually worth today in rupee terms.

---

## Problem Statement

An Indian investor holding US Gold ETFs (e.g., GLD) earns returns on **two axes**:
1. The ETF's price movement in USD
2. The USD/INR exchange rate movement

If GLD goes up 2% in USD but USD also strengthens 1.5% vs INR, the investor actually gains ~3.53% in INR terms — not just 2%. This app makes that combined effect visible at a glance.

---

## Core Calculation

```
combined_change% = ((1 + etf_change_pct/100) × (1 + usd_inr_change_pct/100) - 1) × 100
```

Where:
- `etf_change_pct`    = `(current_price_USD - prev_close_USD) / prev_close_USD × 100`
- `usd_inr_change_pct` = `(current_rate - prev_rate) / prev_rate × 100`

### Example

| Component      | Value           |
|----------------|-----------------|
| GLD today      | $230.50         |
| GLD prev close | $226.00         |
| ETF change     | +1.99%          |
| USD/INR today  | ₹86.80          |
| USD/INR prev   | ₹86.20          |
| USD/INR change | +0.70%          |
| **Combined**   | **+2.70%**      |

INR equivalent: GLD in INR terms went from `226.00 × 86.20 = ₹19,481.20` to `230.50 × 86.80 = ₹20,007.40`

---

## Tech Stack

| Layer       | Choice                                  |
|-------------|----------------------------------------|
| Framework   | Next.js 14+ (App Router)               |
| Language    | TypeScript                              |
| Styling     | Tailwind CSS                            |
| State       | React hooks + SWR for data fetching     |
| Deployment  | Node.js server (standalone Next.js)     |

---

## Data Sources (Free, No API Key Required)

### 1. Yahoo Finance (Unofficial)

Used for both ETF prices and USD/INR rate — no key required.

**ETF Quote:**
```
GET https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d&range=5d
```
Symbols: `GLD`, `IAU`, `GLDM`

**USD/INR Rate:**
```
GET https://query1.finance.yahoo.com/v8/finance/chart/USDINR=X?interval=1d&range=5d
```

**Response fields used:**
- `meta.regularMarketPrice` — current price
- `meta.previousClose` — previous close
- `meta.regularMarketChangePercent` — daily change %
- `meta.regularMarketTime` — last trade timestamp
- `meta.marketState` — REGULAR | PRE | POST | CLOSED

### 2. Open Exchange Rates (Free Tier Fallback)

```
GET https://open.er-api.com/v6/latest/USD
```

No key required. Returns `rates.INR` as current USD/INR rate. Used as fallback when Yahoo Finance is unavailable. Does **not** provide previous close — only use for current rate fallback.

---

## ETFs Tracked (Default)

| Ticker | Name                    | Issuer       |
|--------|-------------------------|--------------|
| GLD    | SPDR Gold Shares        | State Street |
| IAU    | iShares Gold Trust      | BlackRock    |
| GLDM   | SPDR Gold MiniShares    | State Street |

---

## Application Structure

```
Pricetracker/
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.example
├── .gitignore
│
├── app/                            # Next.js App Router
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Main dashboard page
│   ├── globals.css
│   └── api/
│       ├── prices/
│       │   └── route.ts            # GET /api/prices — current prices
│       └── history/
│           └── route.ts            # GET /api/history?symbol=GLD — historical
│
├── components/
│   ├── Dashboard.tsx               # Main layout with all cards
│   ├── EtfCard.tsx                 # Individual ETF price card
│   ├── ForexCard.tsx               # USD/INR card
│   ├── CombinedMetric.tsx          # Combined INR return display
│   ├── RefreshControls.tsx         # Auto-refresh toggle + interval picker
│   ├── LastUpdated.tsx             # "Updated 2 mins ago" timestamp
│   └── MarketStatus.tsx            # Market open/closed indicator
│
├── lib/
│   ├── yahoo.ts                    # Yahoo Finance API client
│   ├── forex.ts                    # Open Exchange Rates fallback client
│   ├── calculator.ts               # Combined metric calculation logic
│   └── cache.ts                    # Server-side in-memory cache (60s TTL)
│
└── types/
    └── prices.ts                   # Shared TypeScript interfaces
```

---

## API Routes

### `GET /api/prices`

Returns current prices for all tracked ETFs and USD/INR.

**Response:**
```json
{
  "timestamp": "2026-03-04T10:30:00Z",
  "marketState": "REGULAR",
  "forex": {
    "symbol": "USDINR=X",
    "currentRate": 86.80,
    "previousRate": 86.20,
    "changePercent": 0.70,
    "change": 0.60
  },
  "etfs": [
    {
      "symbol": "GLD",
      "name": "SPDR Gold Shares",
      "currentPrice": 230.50,
      "previousClose": 226.00,
      "changeUSD": 4.50,
      "changePercentUSD": 1.99,
      "combinedChangeINR": 2.70,
      "currentPriceINR": 20007.40,
      "previousPriceINR": 19481.20,
      "marketState": "REGULAR",
      "lastTradeTime": "2026-03-04T20:59:00Z"
    }
  ],
  "cachedAt": "2026-03-04T10:29:45Z"
}
```

**Server-side caching:** Responses are cached for 60 seconds to avoid Yahoo Finance rate limiting. Cache is keyed by route.

### `GET /api/history?symbol=GLD&period=1mo`

Returns OHLC daily data for a symbol (ETF or USDINR=X). Periods: `1d`, `5d`, `1mo`, `3mo`, `6mo`, `1y`.

---

## UI Components

### Dashboard (`app/page.tsx`)

```
┌──────────────────────────────────────────────────────────┐
│  GoldINR Tracker                    [Market: OPEN] [↻ 5m] │
├──────────────────────────────────────────────────────────┤
│  USD/INR                                                   │
│  ₹86.80  ▲ +0.60 (+0.70%)                                 │
├───────────────┬───────────────┬──────────────────────────┤
│  GLD          │  IAU          │  GLDM                      │
│  $230.50      │  $46.22       │  $23.10                    │
│  ▲ +1.99% USD │  ▲ +1.96% USD │  ▲ +2.01% USD             │
│  ▲ +2.70% INR │  ▲ +2.67% INR │  ▲ +2.72% INR             │
├───────────────┴───────────────┴──────────────────────────┤
│  Combined Calculation (GLD example)                        │
│  ETF change: +1.99% × USD/INR change: +0.70% = +2.70% INR │
│  Formula: (1.0199 × 1.0070) - 1 = 0.02701                 │
├──────────────────────────────────────────────────────────┤
│  Last updated: 2 minutes ago                               │
└──────────────────────────────────────────────────────────┘
```

### EtfCard

Displays for each ETF:
- Ticker symbol + full name
- Current USD price
- USD daily change (absolute + %)
- **Combined INR change %** (highlighted, larger font)
- Current INR equivalent price
- Color coding: green (positive) / red (negative) / gray (no change)

### ForexCard

Displays:
- USD/INR current rate
- Daily change (absolute + %)
- Market hours note (forex is 24/5)

### CombinedMetric

A breakdown panel showing the calculation step-by-step for a selected ETF:
- ETF change %
- USD/INR change %
- Combined formula display
- Final combined %

### RefreshControls

- Toggle: Auto-refresh ON/OFF
- Interval selector: 1m | 5m | 15m | 30m (default: 5m)
- Manual refresh button

---

## Data Flow

```
Browser (React)
    │
    │  SWR polling (every N minutes)
    ▼
Next.js API Route (/api/prices)
    │
    │  Check in-memory cache (60s TTL)
    │  Cache miss ──────────────────►  Yahoo Finance API
    │                                   - GLD, IAU, GLDM quotes
    │                                   - USDINR=X rate
    │  Cache hit ◄──────────────────
    │
    │  Run calculator.ts
    │  (compute combinedChangeINR for each ETF)
    │
    ▼
Browser renders updated cards
```

---

## Calculation Module (`lib/calculator.ts`)

```typescript
interface CombinedMetricInput {
  etfCurrentPrice: number;
  etfPreviousClose: number;
  usdInrCurrent: number;
  usdInrPrevious: number;
}

interface CombinedMetricResult {
  etfChangePercent: number;
  usdInrChangePercent: number;
  combinedChangePercent: number;    // the key metric
  etfCurrentPriceINR: number;
  etfPreviousPriceINR: number;
}

function calculateCombinedChange(input: CombinedMetricInput): CombinedMetricResult {
  const etfChange = (input.etfCurrentPrice - input.etfPreviousClose) / input.etfPreviousClose;
  const fxChange  = (input.usdInrCurrent - input.usdInrPrevious) / input.usdInrPrevious;
  const combined  = (1 + etfChange) * (1 + fxChange) - 1;

  return {
    etfChangePercent:     etfChange * 100,
    usdInrChangePercent:  fxChange * 100,
    combinedChangePercent: combined * 100,
    etfCurrentPriceINR:   input.etfCurrentPrice * input.usdInrCurrent,
    etfPreviousPriceINR:  input.etfPreviousClose * input.usdInrPrevious,
  };
}
```

---

## Error Handling

| Scenario                         | Behavior                                          |
|----------------------------------|---------------------------------------------------|
| Yahoo Finance unavailable        | Show last cached data + "Stale data" warning      |
| USD/INR data unavailable         | Fall back to Open Exchange Rates                  |
| Both sources unavailable         | Show error state with last known data             |
| Market closed (weekends/holidays)| Show previous close data + "Market Closed" badge  |
| Rate limit hit                   | Serve from cache, extend TTL to 5 minutes         |

---

## Environment Variables

```bash
# .env.example

# Optional: override default cache TTL (seconds)
CACHE_TTL_SECONDS=60

# Optional: comma-separated list of ETF symbols to track
TRACKED_ETFS=GLD,IAU,GLDM

# Optional: custom Yahoo Finance base URL (for proxying)
YAHOO_FINANCE_BASE_URL=https://query1.finance.yahoo.com
```

No API keys required for the default free-tier setup.

---

## Non-Functional Requirements

- **Refresh latency**: Data must be fetchable within 3 seconds
- **Cache**: Server-side 60s TTL prevents hammering free APIs
- **Responsive**: Works on mobile and desktop
- **Accessible**: Color is not the only indicator — use ▲/▼ arrows alongside green/red
- **No auth required**: Public read-only dashboard

---

## Out of Scope (v1)

- User accounts / saved portfolios
- Push notifications / price alerts
- Historical charts (can be added in v2 using `/api/history` route already specced)
- Other asset classes (silver, bitcoin, etc.)
- INR-denominated gold ETFs (Nippon, SBI)
- Brokerage integration

---

## Implementation Phases

### Phase 1 — Core (MVP)
1. Set up Next.js project with TypeScript + Tailwind
2. Implement `lib/yahoo.ts` — fetch quotes from Yahoo Finance
3. Implement `lib/calculator.ts` — combined change calculation
4. Implement `app/api/prices/route.ts` with 60s cache
5. Build `EtfCard`, `ForexCard`, `Dashboard` components
6. Auto-refresh via SWR polling

### Phase 2 — Polish
7. `MarketStatus` indicator (open/closed/pre/post)
8. `CombinedMetric` breakdown panel
9. Error/stale-data states
10. Mobile-responsive layout

### Phase 3 — Enhancements (v2)
11. Historical charts using `/api/history`
12. Portfolio calculator (shares × current INR price)
13. Configurable ETF list
