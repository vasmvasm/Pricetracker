export type MarketState =
  | "REGULAR"
  | "PRE"
  | "POST"
  | "CLOSED"
  | "PREPRE"
  | "POSTPOST";

export interface QuoteData {
  symbol: string;
  name: string;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  marketState: MarketState;
  lastTradeTime: number; // unix timestamp (seconds)
  dayHigh?: number;
  dayLow?: number;
  volume?: number;
}

export interface ForexData {
  symbol: string;
  currentRate: number;
  previousRate: number;
  change: number;
  changePercent: number;
  lastTradeTime: number;
}

export interface EtfWithINR extends QuoteData {
  etfChangePercent: number;
  usdInrChangePercent: number;
  combinedChangeINR: number;
  currentPriceINR: number;
  previousPriceINR: number;
}

export interface PricesResponse {
  timestamp: string;
  forex: ForexData;
  etfs: EtfWithINR[];
  cachedAt: string;
  stale?: boolean;
}

export interface HistoryPoint {
  date: string; // ISO date string
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
