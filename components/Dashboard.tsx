"use client";

import { useState } from "react";
import type { PricesResponse } from "@/types/prices";
import ForexCard from "./ForexCard";
import EtfCard from "./EtfCard";
import CombinedMetric from "./CombinedMetric";
import MarketStatus from "./MarketStatus";
import LastUpdated from "./LastUpdated";
import RefreshControls from "./RefreshControls";

interface Props {
  data: PricesResponse;
  refreshInterval: number;
  onIntervalChange: (interval: number) => void;
  onManualRefresh: () => void;
  isLoading: boolean;
}

export default function Dashboard({
  data,
  refreshInterval,
  onIntervalChange,
  onManualRefresh,
  isLoading,
}: Props) {
  const [selectedEtf, setSelectedEtf] = useState<string>(
    data.etfs[0]?.symbol ?? ""
  );

  const selectedEtfData = data.etfs.find((e) => e.symbol === selectedEtf);
  const marketState = data.etfs[0]?.marketState ?? "CLOSED";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🥇</span>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                GoldINR Tracker
              </h1>
              <p className="text-xs text-slate-400">
                US Gold ETFs · USD/INR · Combined INR Return
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MarketStatus state={marketState} />
            <RefreshControls
              interval={refreshInterval}
              onChange={onIntervalChange}
              onManualRefresh={onManualRefresh}
              isLoading={isLoading}
            />
          </div>
        </div>
      </header>

      {/* Stale data warning */}
      {data.stale && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-5xl mx-auto px-4 py-2 flex items-center gap-2 text-sm text-amber-700">
            <span>⚠️</span>
            <span>
              Live data unavailable — showing last cached prices. Values may be
              outdated.
            </span>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* USD/INR */}
        <section>
          <ForexCard forex={data.forex} />
        </section>

        {/* ETF Cards */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
            US Gold ETFs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {data.etfs.map((etf) => (
              <EtfCard
                key={etf.symbol}
                etf={etf}
                selected={etf.symbol === selectedEtf}
                onClick={() =>
                  setSelectedEtf((prev) =>
                    prev === etf.symbol ? "" : etf.symbol
                  )
                }
              />
            ))}
          </div>
          {data.etfs.length > 0 && (
            <p className="text-xs text-slate-400 mt-2">
              Click an ETF card to see the combined INR return breakdown below.
            </p>
          )}
        </section>

        {/* Combined Metric Breakdown */}
        {selectedEtfData && (
          <section>
            <CombinedMetric etf={selectedEtfData} />
          </section>
        )}

        {/* Footer */}
        <footer className="flex items-center justify-between pt-2 pb-6 border-t border-slate-200">
          <LastUpdated timestamp={data.cachedAt} stale={data.stale} />
          <p className="text-xs text-slate-400">
            Data via Yahoo Finance · For informational purposes only
          </p>
        </footer>
      </main>
    </div>
  );
}
