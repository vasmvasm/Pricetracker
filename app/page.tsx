"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import type { PricesResponse } from "@/types/prices";
import Dashboard from "@/components/Dashboard";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });

export default function Home() {
  const [refreshInterval, setRefreshInterval] = useState(300); // 5 min default

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<PricesResponse>("/api/prices", fetcher, {
      refreshInterval: refreshInterval > 0 ? refreshInterval * 1000 : 0,
      revalidateOnFocus: false,
      dedupingInterval: 30_000,
    });

  const handleManualRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-5xl animate-pulse">🥇</div>
          <p className="text-slate-500 text-sm">Fetching live prices…</p>
        </div>
      </div>
    );
  }

  if (error || !data || "error" in data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="max-w-sm text-center space-y-4 px-4">
          <div className="text-5xl">⚠️</div>
          <h2 className="text-lg font-semibold text-slate-800">
            Failed to load prices
          </h2>
          <p className="text-slate-500 text-sm">
            {error?.message ??
              (data as { error?: string })?.error ??
              "Unable to connect to data sources. Please try again."}
          </p>
          <button
            onClick={handleManualRefresh}
            className="mt-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <Dashboard
      data={data}
      refreshInterval={refreshInterval}
      onIntervalChange={setRefreshInterval}
      onManualRefresh={handleManualRefresh}
      isLoading={isValidating}
    />
  );
}
