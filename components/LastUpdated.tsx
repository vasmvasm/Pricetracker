"use client";

import { useEffect, useState } from "react";

interface Props {
  timestamp: string; // ISO string
  stale?: boolean;
}

function timeAgo(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 10) return "just now";
  if (diff < 60) return `${diff}s ago`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

export default function LastUpdated({ timestamp, stale }: Props) {
  const [label, setLabel] = useState(() => timeAgo(timestamp));

  useEffect(() => {
    setLabel(timeAgo(timestamp));
    const id = setInterval(() => setLabel(timeAgo(timestamp)), 15_000);
    return () => clearInterval(id);
  }, [timestamp]);

  return (
    <span className="text-sm text-slate-400 flex items-center gap-1.5">
      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
          clipRule="evenodd"
        />
      </svg>
      Updated {label}
      {stale && (
        <span className="text-amber-500 font-medium">&nbsp;· Stale data</span>
      )}
    </span>
  );
}
