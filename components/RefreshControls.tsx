"use client";

interface Props {
  interval: number; // seconds, 0 = paused
  onChange: (interval: number) => void;
  onManualRefresh: () => void;
  isLoading: boolean;
}

const INTERVALS = [
  { label: "1m", value: 60 },
  { label: "5m", value: 300 },
  { label: "15m", value: 900 },
  { label: "30m", value: 1800 },
];

export default function RefreshControls({
  interval,
  onChange,
  onManualRefresh,
  isLoading,
}: Props) {
  const enabled = interval > 0;

  return (
    <div className="flex items-center gap-2">
      {/* Manual refresh */}
      <button
        onClick={onManualRefresh}
        disabled={isLoading}
        title="Refresh now"
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
      >
        <svg
          className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Auto-refresh toggle */}
      <button
        onClick={() => onChange(enabled ? 0 : 300)}
        className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
          enabled
            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
        }`}
      >
        {enabled ? "Auto ✓" : "Auto"}
      </button>

      {/* Interval buttons — only shown when enabled */}
      {enabled && (
        <div className="flex gap-1">
          {INTERVALS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`text-xs px-2 py-0.5 rounded font-medium transition-colors ${
                interval === opt.value
                  ? "bg-amber-500 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
