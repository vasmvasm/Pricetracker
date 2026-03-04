import type { EtfWithINR } from "@/types/prices";

interface Props {
  etf: EtfWithINR;
  selected?: boolean;
  onClick?: () => void;
}

function PctBadge({ value, large }: { value: number; large?: boolean }) {
  const sign = value >= 0 ? "+" : "";
  const isPositive = value > 0;
  const isNegative = value < 0;

  return (
    <span
      className={`inline-flex items-center gap-0.5 font-semibold rounded ${
        large ? "text-sm px-2 py-0.5" : "text-xs px-1.5 py-0.5"
      } ${
        isPositive
          ? "bg-emerald-50 text-emerald-700"
          : isNegative
          ? "bg-red-50 text-red-700"
          : "bg-slate-50 text-slate-500"
      }`}
    >
      {isPositive ? "▲" : isNegative ? "▼" : "—"}
      {sign}
      {value.toFixed(2)}%
    </span>
  );
}

export default function EtfCard({ etf, selected, onClick }: Props) {
  const combinedPositive = etf.combinedChangeINR > 0;
  const combinedNegative = etf.combinedChangeINR < 0;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white rounded-2xl shadow-sm border transition-all ${
        selected
          ? "border-amber-400 ring-2 ring-amber-200"
          : "border-slate-100 hover:border-amber-200 hover:shadow-md"
      } p-5`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-0.5">
            {etf.symbol}
          </p>
          <p className="text-sm text-slate-500 leading-tight">{etf.name}</p>
        </div>
        <span className="text-2xl">🥇</span>
      </div>

      {/* USD Price */}
      <div className="mb-1">
        <span className="text-3xl font-bold text-slate-800 tabular-nums">
          ${etf.currentPrice.toFixed(2)}
        </span>
      </div>

      {/* USD Change */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`text-sm font-semibold ${
            etf.changePercent > 0
              ? "text-emerald-600"
              : etf.changePercent < 0
              ? "text-red-600"
              : "text-slate-500"
          }`}
        >
          {etf.changePercent > 0 ? "▲" : etf.changePercent < 0 ? "▼" : "—"}
          {etf.changePercent > 0 ? "+" : ""}
          {etf.change.toFixed(2)} USD
        </span>
        <PctBadge value={etf.changePercent} />
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 mb-4" />

      {/* Combined INR Change — the key metric */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
          Combined INR Return
        </p>
        <div className="flex items-baseline gap-2">
          <span
            className={`text-2xl font-bold tabular-nums ${
              combinedPositive
                ? "text-emerald-600"
                : combinedNegative
                ? "text-red-600"
                : "text-slate-500"
            }`}
          >
            {combinedPositive ? "+" : ""}
            {etf.combinedChangeINR.toFixed(2)}%
          </span>
          <span className="text-xs text-slate-400">in ₹ today</span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          ₹{etf.currentPriceINR.toFixed(2)} per share
        </p>
      </div>

      {selected && (
        <div className="mt-2 text-xs text-amber-600 font-medium">
          Click to see breakdown ↓
        </div>
      )}
    </button>
  );
}
