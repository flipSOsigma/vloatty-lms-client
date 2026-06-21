"use client";

import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const sizeMap = {
  sm: "w-8 h-8",
  md: "w-16 h-16",
  lg: "w-24 h-24",
};

const ringBorderMap = {
  sm: "border-2",
  md: "border-[3px]",
  lg: "border-4",
};

/**
 * A premium nested 4-ring counter-rotating loading spinner (young-goat-78 theme).
 */
export default function LoadingSpinner({
  size = "md",
  label,
  className = "",
}: LoadingSpinnerProps) {
  const sizeClass = sizeMap[size];
  const borderClass = ringBorderMap[size];

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 py-12 ${className}`}
    >
      {/* 4 Concentric counter-rotating loader rings */}
      <div className={`relative ${sizeClass} flex items-center justify-center`}>
        {/* Ring 1 (Outermost) - Orange */}
        <div className={`absolute inset-0 rounded-full ${borderClass} border-transparent border-t-[#f97316] animate-spin`} />
        
        {/* Ring 2 - Gold */}
        <div className={`absolute inset-[11%] rounded-full ${borderClass} border-transparent border-t-[#d97706] animate-spin-reverse`}
             style={{ animationDuration: "1.5s" }} />
        
        {/* Ring 3 - Yellow */}
        <div className={`absolute inset-[22%] rounded-full ${borderClass} border-transparent border-t-[#facc15] animate-spin`}
             style={{ animationDuration: "1s" }} />
             
        {/* Ring 4 (Innermost) - Gold */}
        <div className={`absolute inset-[33%] rounded-full ${borderClass} border-transparent border-t-[#d97706] animate-spin-reverse`}
             style={{ animationDuration: "0.6s" }} />
      </div>
      
      {label && (
        <span className="text-[11px] text-zinc-500 font-extrabold uppercase tracking-widest animate-pulse">
          {label}
        </span>
      )}
    </div>
  );
}
