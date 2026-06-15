"use client";

import React from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  currentSort: string | null;
  sortDir: "asc" | "desc";
  onSort: (key: string) => void;
  className?: string;
}

export default function SortableHeader({
  label,
  sortKey,
  currentSort,
  sortDir,
  onSort,
  className = "",
}: SortableHeaderProps) {
  const isActive = currentSort === sortKey;

  return (
    <th
      className={`pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider cursor-pointer select-none group ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <span className="flex items-center gap-1 hover:text-zinc-600 transition-colors">
        {label}
        {isActive ? (
          sortDir === "asc" ? (
            <ChevronUp className="w-3 h-3 text-[#f25c88]" />
          ) : (
            <ChevronDown className="w-3 h-3 text-[#f25c88]" />
          )
        ) : (
          <ChevronsUpDown className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
        )}
      </span>
    </th>
  );
}
