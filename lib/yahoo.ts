import type { QuoteData, ForexData, HistoryPoint, MarketState } from "@/types/prices";

const BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart";

const ETF_NAMES: Record<string, string> = {
  GLD: "SPDR Gold Shares",
  IAU: "iShares Gold Trust",
  GLDM: "SPDR Gold MiniShares",
};

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseMeta(meta: any, symbol: string): QuoteData {
  const currentPrice: number =
    meta.regularMarketPrice ?? meta.chartPreviousClose;
  const previousClose: number =
    meta.previousClose ?? meta.chartPreviousClose ?? currentPrice;
  const change = currentPrice - previousClose;
  const changePercent =
    meta.regularMarketChangePercent ?? (change / previousClose) * 100;

  return {
    symbol,
    name: ETF_NAMES[symbol] ?? symbol,
    currentPrice,
    previousClose,
    change,
    changePercent,
    marketState: (meta.marketState ?? "CLOSED") as MarketState,
    lastTradeTime: meta.regularMarketTime ?? Math.floor(Date.now() / 1000),
    dayHigh: meta.regularMarketDayHigh,
    dayLow: meta.regularMarketDayLow,
    volume: meta.regularMarketVolume,
  };
}

export async function fetchETFQuote(symbol: string): Promise<QuoteData> {
  const url = `${BASE_URL}/${symbol}?interval=1d&range=2d`;
  const res = await fetch(url, {
    headers: FETCH_HEADERS,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Yahoo Finance returned ${res.status} for ${symbol}`);
  }

  const json = await res.json();
  const result = json?.chart?.result?.[0];
  if (!result?.meta) {
    throw new Error(`No data in Yahoo Finance response for ${symbol}`);
  }

  return parseMeta(result.meta, symbol);
}

export async function fetchForexQuote(): Promise<ForexData> {
  const symbol = "USDINR=X";
  const url = `${BASE_URL}/${symbol}?interval=1d&range=2d`;
  const res = await fetch(url, {
    headers: FETCH_HEADERS,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Yahoo Finance returned ${res.status} for ${symbol}`);
  }

  const json = await res.json();
  const result = json?.chart?.result?.[0];
  if (!result?.meta) {
    throw new Error(`No data in Yahoo Finance response for ${symbol}`);
  }

  const meta = result.meta;
  const currentRate: number =
    meta.regularMarketPrice ?? meta.chartPreviousClose;
  const previousRate: number =
    meta.previousClose ?? meta.chartPreviousClose ?? currentRate;
  const change = currentRate - previousRate;
  const changePercent =
    meta.regularMarketChangePercent ?? (change / previousRate) * 100;

  return {
    symbol,
    currentRate,
    previousRate,
    change,
    changePercent,
    lastTradeTime: meta.regularMarketTime ?? Math.floor(Date.now() / 1000),
  };
}

export async function fetchHistory(
  symbol: string,
  period: string
): Promise<HistoryPoint[]> {
  const rangeMap: Record<string, string> = {
    "1d": "1d",
    "5d": "5d",
    "1mo": "1mo",
    "3mo": "3mo",
    "6mo": "6mo",
    "1y": "1y",
  };
  const intervalMap: Record<string, string> = {
    "1d": "5m",
    "5d": "60m",
    "1mo": "1d",
    "3mo": "1d",
    "6mo": "1d",
    "1y": "1d",
  };

  const range = rangeMap[period] ?? "1mo";
  const interval = intervalMap[period] ?? "1d";
  const url = `${BASE_URL}/${symbol}?interval=${interval}&range=${range}`;

  const res = await fetch(url, { headers: FETCH_HEADERS, cache: "no-store" });
  if (!res.ok) throw new Error(`Yahoo Finance history error ${res.status}`);

  const json = await res.json();
  const result = json?.chart?.result?.[0];
  if (!result) return [];

  const timestamps: number[] = result.timestamp ?? [];
  const quotes = result.indicators?.quote?.[0] ?? {};
  const opens: number[] = quotes.open ?? [];
  const highs: number[] = quotes.high ?? [];
  const lows: number[] = quotes.low ?? [];
  const closes: number[] = quotes.close ?? [];
  const volumes: number[] = quotes.volume ?? [];

  return timestamps
    .map((ts, i) => ({
      date: new Date(ts * 1000).toISOString(),
      open: opens[i] ?? 0,
      high: highs[i] ?? 0,
      low: lows[i] ?? 0,
      close: closes[i] ?? 0,
      volume: volumes[i] ?? 0,
    }))
    .filter((p) => p.close > 0);
}
