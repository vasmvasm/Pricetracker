import type { ForexData } from "@/types/prices";

interface Props {
  forex: ForexData;
}

function ChangeLabel({ value }: { value: number }) {
  const sign = value >= 0 ? "+" : "";
  const color =
    value > 0
      ? "text-emerald-600"
      : value < 0
      ? "text-red-600"
      : "text-slate-500";
  const arrow = value > 0 ? "▲" : value < 0 ? "▼" : "—";

  return (
    <span className={`font-semibold ${color}`}>
      {arrow} {sign}
      {value.toFixed(4)} ({sign}
      {value === 0 ? "—" : `${value >= 0 ? "+" : ""}${(value).toFixed(2)}%`})
    </span>
  );
}

export default function ForexCard({ forex }: Props) {
  const isPositive = forex.changePercent > 0;
  const isNegative = forex.changePercent < 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-0.5">
            USD / INR
          </p>
          <p className="text-sm text-slate-500">US Dollar to Indian Rupee</p>
        </div>
        <span className="text-xl">🇮🇳</span>
      </div>

      <div className="flex items-baseline gap-3 mb-2">
        <span className="text-4xl font-bold text-slate-800 tabular-nums">
          ₹{forex.currentRate.toFixed(4)}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm">
        {forex.changePercent === 0 ? (
          <span className="text-slate-400 text-sm">
            Previous close unavailable (fallback source)
          </span>
        ) : (
          <>
            <span
              className={`inline-flex items-center gap-1 font-semibold ${
                isPositive
                  ? "text-emerald-600"
                  : isNegative
                  ? "text-red-600"
                  : "text-slate-500"
              }`}
            >
              {isPositive ? "▲" : isNegative ? "▼" : "—"}
              {Math.abs(forex.change).toFixed(4)}
            </span>
            <span
              className={`text-sm font-medium px-1.5 py-0.5 rounded ${
                isPositive
                  ? "bg-emerald-50 text-emerald-700"
                  : isNegative
                  ? "bg-red-50 text-red-700"
                  : "bg-slate-50 text-slate-500"
              }`}
            >
              {isPositive ? "+" : ""}
              {forex.changePercent.toFixed(2)}%
            </span>
            <span className="text-slate-400">today</span>
          </>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-50 text-xs text-slate-400">
        Prev close: ₹{forex.previousRate.toFixed(4)}
      </div>
    </div>
  );
}
