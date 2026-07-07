"use client";

import React from "react";
import { Search } from "lucide-react";

interface TableControlsProps {
  search: string;
  onSearchChange: (val: string) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  total: number;
  filtered: number;
  searchPlaceholder?: string;
}

export default function TableControls({
  search,
  onSearchChange,
  pageSize,
  onPageSizeChange,
  total,
  filtered,
  searchPlaceholder = "Search...",
}: TableControlsProps) {
  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="bg-white border border-zinc-200 rounded-xl pl-8 pr-3 py-2 text-[12px] w-64 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 transition-all text-[#121212] font-medium placeholder:text-zinc-400"
          />
        </div>
        {total !== filtered && (
          <span className="text-[10.5px] font-bold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full border border-zinc-200">
            Showing {filtered} of {total}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 text-[12px] font-bold text-zinc-500">
        <span>Show:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-[12px] font-bold text-[#121212] focus:outline-none focus:border-zinc-400 cursor-pointer transition-all"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
}
