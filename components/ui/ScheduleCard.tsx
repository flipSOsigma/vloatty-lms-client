"use client";

import React from "react";
import { MapPin, GraduationCap } from "lucide-react";
import { LmsEvent } from "../../types/lms";

interface ScheduleCardProps {
  event: LmsEvent;
  lecturerName?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export default function ScheduleCard({ event, lecturerName, onClick, style }: ScheduleCardProps) {
  // Color mappings matching SubjectCard palettes
  let colorTheme = {
    bg: "bg-[#ECE8E0] hover:bg-[#E5E1D8]",
    border: "border border-zinc-200/50 border-l-[4px] border-l-zinc-400/40",
  };

  if (event.color === "yellow") {
    colorTheme = {
      bg: "bg-[#FAD56B] hover:bg-[#F8CC4F]",
      border: "border border-amber-400/20 border-l-[4px] border-l-amber-600/40",
    };
  } else if (event.color === "blue") {
    colorTheme = {
      bg: "bg-[#BFD3F7] hover:bg-[#ADC5F5]",
      border: "border border-blue-400/20 border-l-[4px] border-l-blue-600/40",
    };
  } else if (event.color === "image-text") {
    colorTheme = {
      bg: "bg-[#F3F0EA]/70 hover:bg-[#ECE8E0]/90",
      border: "border border-[#E5E1D8]/80 border-l-[4px] border-l-zinc-400/40",
    };
  }

  return (
    <div
      onClick={onClick}
      style={style}
      className={`absolute p-3.5 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.015] hover:shadow-[0_8px_20px_rgba(0,0,0,0.03)] cursor-pointer overflow-hidden select-none ${colorTheme.bg} ${colorTheme.border}`}
    >
      <div className="flex flex-col gap-1.5 h-full text-left justify-between">
        {/* Title */}
        <h3 className="text-[12.5px] font-extrabold text-zinc-950 leading-tight line-clamp-2">
          {event.title}
        </h3>

        {/* Metadata Section: Lecturer & Room */}
        <div className="flex flex-col gap-1 mt-auto">
          {/* Lecturer */}
          {lecturerName && (
            <div className="flex items-center gap-1 text-[9.5px] text-zinc-500 font-semibold truncate">
              <GraduationCap className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
              <span className="truncate">{lecturerName}</span>
            </div>
          )}

          {/* Room / Location */}
          {event.subtitle && (
            <div className="flex items-center gap-1 text-[9.5px] text-zinc-500 font-bold truncate">
              <MapPin className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
              <span className="truncate">{event.subtitle}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
