"use client";

import React from "react";

interface Segment {
  value: number;
  color: string;
  backgroundImage?: string;
}

interface DetailItem {
  label: string;
  value: string | number;
  color: string;
  backgroundImage?: string;
}

interface StatsSegmentCardProps {
  title: string;
  value: string;
  segments: Segment[];
  details: DetailItem[];
}

export default function StatsSegmentCard({ title, value, segments, details }: StatsSegmentCardProps) {
  const totalSegmentValue = segments.reduce((acc, s) => acc + s.value, 0);

  return (
    <div className="bg-white border border-[#EFECE6] p-6 rounded-2xl flex flex-col justify-between shadow-xs select-none hover:shadow-sm hover:border-zinc-350 transition-all duration-300">
      <div className="flex flex-col text-left">
        <span className="text-[10px] font-normal text-zinc-400 leading-normal tracking-wide">{title}</span>
        <h3 className="text-xl font-bold tracking-tight text-zinc-900 mt-1 leading-none">
          {value}
        </h3>
      </div>

      {/* Horizontal Segmented Progress Bar */}
      <div className="flex items-center gap-0.5 w-full h-3.5 my-4 overflow-hidden rounded-full shrink-0 bg-zinc-50 border border-[#EFECE6]/40">
        {segments.map((seg, idx) => {
          const widthPct = totalSegmentValue > 0 ? (seg.value / totalSegmentValue) * 100 : (100 / segments.length);
          if (widthPct <= 0) return null;
          return (
            <div
              key={idx}
              className="h-full transition-all rounded duration-300"
              style={{ 
                width: `${widthPct}%`,
                backgroundColor: seg.color,
                backgroundImage: seg.backgroundImage
              }}
            />
          );
        })}
      </div>

      {/* Details List */}
      <div className="flex flex-col gap-2.5 my-2">
        {details.map((detail, idx) => (
          <div key={idx} className="flex items-center justify-between text-[11.5px] font-semibold text-zinc-650">
            <div className="flex items-center gap-2">
              <span 
                className="w-2.5 h-2.5 rounded-full border border-[#EFECE6]/50" 
                style={{ 
                  backgroundColor: detail.color,
                  backgroundImage: detail.backgroundImage
                }}
              />
              <span>{detail.label}</span>
            </div>
            <span>{detail.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
