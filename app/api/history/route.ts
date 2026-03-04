import { NextRequest, NextResponse } from "next/server";
import { fetchHistory } from "@/lib/yahoo";
import { getCached, setCached } from "@/lib/cache";
import type { HistoryPoint } from "@/types/prices";

export const dynamic = "force-dynamic";

const VALID_SYMBOLS = new Set(["GLD", "IAU", "GLDM", "USDINR=X"]);
const VALID_PERIODS = new Set(["1d", "5d", "1mo", "3mo", "6mo", "1y"]);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = (searchParams.get("symbol") ?? "GLD").toUpperCase();
  const period = searchParams.get("period") ?? "1mo";

  if (!VALID_SYMBOLS.has(symbol)) {
    return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
  }
  if (!VALID_PERIODS.has(period)) {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  }

  const cacheKey = `history:${symbol}:${period}`;
  const cached = getCached<HistoryPoint[]>(cacheKey);
  if (cached) {
    return NextResponse.json(cached.data);
  }

  try {
    const data = await fetchHistory(symbol, period);
    // Cache history for 5 minutes
    setCached(cacheKey, data, 300);
    return NextResponse.json(data);
  } catch (err) {
    console.error("History fetch failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch historical data" },
      { status: 503 }
    );
  }
}
