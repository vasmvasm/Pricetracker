import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { fetchETFQuote, fetchForexQuote } from "@/lib/yahoo";
import { fetchForexFallback } from "@/lib/forex";
import { calculateCombined } from "@/lib/calculator";
import { getCached, setCached, getStale } from "@/lib/cache";
import type { PricesResponse } from "@/types/prices";

const CACHE_KEY = "prices";
const TTL = Number(process.env.CACHE_TTL_SECONDS ?? 60);
const TRACKED_ETFS = (process.env.TRACKED_ETFS ?? "GLD,IAU,GLDM")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export async function GET() {
  // Return cached data if fresh
  const cached = getCached<PricesResponse>(CACHE_KEY);
  if (cached) {
    return NextResponse.json(cached.data);
  }

  try {
    // Fetch all ETF quotes and forex in parallel
    const [forexResult, ...etfResults] = await Promise.allSettled([
      fetchForexQuote(),
      ...TRACKED_ETFS.map((sym) => fetchETFQuote(sym)),
    ]);

    // Resolve forex — fall back to open.er-api.com if Yahoo fails
    let forex =
      forexResult.status === "fulfilled"
        ? forexResult.value
        : await fetchForexFallback();

    // Resolve ETFs — skip any that failed
    const etfs = etfResults
      .map((r, i) => {
        if (r.status === "fulfilled") return calculateCombined(r.value, forex);
        console.error(`Failed to fetch ${TRACKED_ETFS[i]}:`, (r as PromiseRejectedResult).reason);
        return null;
      })
      .filter(Boolean);

    const now = new Date().toISOString();
    const response: PricesResponse = {
      timestamp: now,
      forex,
      etfs: etfs as PricesResponse["etfs"],
      cachedAt: now,
    };

    setCached(CACHE_KEY, response, TTL);
    return NextResponse.json(response);
  } catch (err) {
    console.error("Failed to fetch prices:", err);

    // Return stale cache as fallback
    const stale = getStale<PricesResponse>(CACHE_KEY);
    if (stale) {
      return NextResponse.json({ ...stale.data, stale: true });
    }

    return NextResponse.json(
      { error: "Failed to fetch price data. Please try again." },
      { status: 503 }
    );
  }
}
