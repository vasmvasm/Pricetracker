import type { EtfWithINR } from "@/types/prices";

interface Props {
  etf: EtfWithINR;
}

function Row({
  label,
  value,
  pct,
  highlight,
}: {
  label: string;
  value: string;
  pct: number;
  highlight?: boolean;
}) {
  const isPos = pct > 0;
  const isNeg = pct < 0;
  const color = isPos
    ? "text-emerald-600"
    : isNeg
    ? "text-red-600"
    : "text-slate-500";

  return (
    <div
      className={`flex items-center justify-between py-2.5 px-4 rounded-xl ${
        highlight ? "bg-amber-50 border border-amber-200" : "bg-slate-50"
      }`}
    >
      <span className="text-sm text-slate-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono text-slate-500">{value}</span>
        <span className={`text-sm font-bold tabular-nums ${color}`}>
          {isPos ? "+" : ""}
          {pct.toFixed(3)}%
        </span>
      </div>
    </div>
  );
}

export default function CombinedMetric({ etf }: Props) {
  const etfSign = etf.etfChangePercent >= 0 ? "+" : "";
  const fxSign = etf.usdInrChangePercent >= 0 ? "+" : "";

  const etfFactor = (1 + etf.etfChangePercent / 100).toFixed(5);
  const fxFactor = (1 + etf.usdInrChangePercent / 100).toFixed(5);
  const combinedFactor = (
    (1 + etf.etfChangePercent / 100) *
    (1 + etf.usdInrChangePercent / 100)
  ).toFixed(5);

  const isPos = etf.combinedChangeINR > 0;
  const isNeg = etf.combinedChangeINR < 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-1">
        INR Return Breakdown
      </h2>
      <p className="text-sm text-slate-500 mb-5">
        How the combined INR return for{" "}
        <span className="font-semibold text-slate-700">{etf.symbol}</span> is
        calculated
      </p>

      <div className="space-y-2 mb-5">
        <Row
          label={`${etf.symbol} price (USD)`}
          value={`$${etf.previousClose.toFixed(2)} → $${etf.currentPrice.toFixed(2)}`}
          pct={etf.etfChangePercent}
        />
        <Row
          label="USD / INR rate"
          value={`₹${etf.previousPriceINR !== 0 ? (etf.previousPriceINR / etf.previousClose).toFixed(4) : "—"} → ₹${(etf.currentPriceINR / etf.currentPrice).toFixed(4)}`}
          pct={etf.usdInrChangePercent}
        />
        <Row
          label={`${etf.symbol} price (INR)`}
          value={`₹${etf.previousPriceINR.toFixed(2)} → ₹${etf.currentPriceINR.toFixed(2)}`}
          pct={etf.combinedChangeINR}
          highlight
        />
      </div>

      {/* Formula display */}
      <div className="bg-slate-800 rounded-xl p-4 text-sm font-mono text-slate-200 space-y-1.5 overflow-x-auto">
        <div className="text-slate-400 text-xs mb-2">// Formula</div>
        <div>
          combined = (1 + ETF%) × (1 + FX%) − 1
        </div>
        <div className="text-slate-400">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = (1 {etfSign}
          {(etf.etfChangePercent / 100).toFixed(5)}) × (1 {fxSign}
          {(etf.usdInrChangePercent / 100).toFixed(5)}) − 1
        </div>
        <div className="text-slate-400">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = {etfFactor} ×{" "}
          {fxFactor} − 1
        </div>
        <div className="text-slate-400">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = {combinedFactor} −
          1
        </div>
        <div
          className={`font-bold ${
            isPos
              ? "text-emerald-400"
              : isNeg
              ? "text-red-400"
              : "text-slate-300"
          }`}
        >
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ={" "}
          {isPos ? "+" : ""}
          {(etf.combinedChangeINR / 100).toFixed(5)} (
          {isPos ? "+" : ""}
          {etf.combinedChangeINR.toFixed(3)}%)
        </div>
      </div>
    </div>
  );
}
