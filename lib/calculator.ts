import type { QuoteData, ForexData, EtfWithINR } from "@/types/prices";

/**
 * Calculate the combined INR-adjusted return for an Indian investor holding a US gold ETF.
 *
 * Formula: combined% = ((1 + etf_change%) × (1 + usd_inr_change%)) - 1
 *
 * This represents the actual change in the ETF's value when denominated in INR,
 * accounting for both the ETF's USD price movement and the USD/INR exchange rate movement.
 */
export function calculateCombined(etf: QuoteData, forex: ForexData): EtfWithINR {
  const etfChangeFrac = etf.changePercent / 100;
  const fxChangeFrac = forex.changePercent / 100;
  const combinedFrac = (1 + etfChangeFrac) * (1 + fxChangeFrac) - 1;

  return {
    ...etf,
    etfChangePercent: etf.changePercent,
    usdInrChangePercent: forex.changePercent,
    combinedChangeINR: combinedFrac * 100,
    currentPriceINR: etf.currentPrice * forex.currentRate,
    previousPriceINR: etf.previousClose * forex.previousRate,
  };
}

export function formatPercent(value: number, decimals = 2): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
