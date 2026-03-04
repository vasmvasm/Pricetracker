import type { ForexData } from "@/types/prices";

/**
 * Fallback forex source when Yahoo Finance is unavailable.
 * open.er-api.com is free and requires no API key.
 * NOTE: This source does not provide previous close, so changePercent will be 0.
 */
export async function fetchForexFallback(): Promise<ForexData> {
  const res = await fetch("https://open.er-api.com/v6/latest/USD", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`ExchangeRate-API returned ${res.status}`);
  }

  const json = await res.json();
  const rate: number = json?.rates?.INR;
  if (!rate) throw new Error("INR rate not found in ExchangeRate-API response");

  return {
    symbol: "USDINR=X",
    currentRate: rate,
    previousRate: rate, // not available from this source
    change: 0,
    changePercent: 0,
    lastTradeTime: Math.floor(Date.now() / 1000),
  };
}
