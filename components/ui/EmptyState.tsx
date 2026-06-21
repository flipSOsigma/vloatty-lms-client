"use client";

import React from "react";

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * A centered empty-state placeholder with dashed border styling.
 */
export default function EmptyState({
  message,
  icon,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`border border-dashed border-[#E5E1D8] bg-[#FAF7F2]/10 rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-3 ${className}`}
    >
      {icon && <div className="text-zinc-400">{icon}</div>}
      <p className="text-[12px] text-zinc-400 font-medium">{message}</p>
    </div>
  );
}
