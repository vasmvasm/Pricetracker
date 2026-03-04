import type { MarketState } from "@/types/prices";

const LABELS: Record<MarketState, string> = {
  REGULAR: "Market Open",
  PRE: "Pre-Market",
  POST: "After Hours",
  PREPRE: "Pre-Market",
  POSTPOST: "After Hours",
  CLOSED: "Market Closed",
};

const STYLES: Record<MarketState, string> = {
  REGULAR: "bg-emerald-100 text-emerald-800",
  PRE: "bg-amber-100 text-amber-800",
  POST: "bg-amber-100 text-amber-800",
  PREPRE: "bg-amber-100 text-amber-800",
  POSTPOST: "bg-amber-100 text-amber-800",
  CLOSED: "bg-slate-100 text-slate-600",
};

const DOTS: Record<MarketState, string> = {
  REGULAR: "bg-emerald-500 animate-pulse",
  PRE: "bg-amber-400",
  POST: "bg-amber-400",
  PREPRE: "bg-amber-400",
  POSTPOST: "bg-amber-400",
  CLOSED: "bg-slate-400",
};

interface Props {
  state: MarketState;
}

export default function MarketStatus({ state }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STYLES[state]}`}
    >
      <span className={`w-2 h-2 rounded-full ${DOTS[state]}`} />
      {LABELS[state]}
    </span>
  );
}
