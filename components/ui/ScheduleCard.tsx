"use client";

import React from "react";
import {
  BookOpen,
  Activity,
  Microscope,
  UserCheck,
  FileText,
  HelpCircle,
  MapPin,
  FileDown,
  Clock,
} from "lucide-react";
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
      border: "border border-[#E5E1D8]/80", // Image card doesn't need left-accent border
    };
  }

  // Get matching category icons
  const getCardIcon = (title: string, color: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes("lecture") || titleLower.includes("algebra")) return <BookOpen className="w-4 h-4 text-zinc-700" />;
    if (titleLower.includes("quiz")) return <Activity className="w-4 h-4 text-[#f25c88]" />;
    if (titleLower.includes("lab")) return <Microscope className="w-4 h-4 text-[#4ba3e3]" />;
    if (titleLower.includes("office hours")) return <UserCheck className="w-4 h-4 text-[#4ba3e3]" />;
    if (color === "yellow") return <FileText className="w-4 h-4 text-amber-800" />;
    return <HelpCircle className="w-4 h-4 text-zinc-500" />;
  };

  // Get matching icon background tints
  const getIconBgClass = (title: string, color: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes("quiz")) return "bg-[#f25c88]/10";
    if (titleLower.includes("lab") || titleLower.includes("office hours")) return "bg-[#4ba3e3]/10";
    if (color === "yellow") return "bg-amber-100";
    return "bg-white/70";
  };

  return (
    <div
      onClick={onClick}
      style={style}
      className={`absolute p-3 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.015] hover:shadow-[0_8px_20px_rgba(0,0,0,0.03)] cursor-pointer overflow-hidden select-none ${colorTheme.bg} ${colorTheme.border}`}
    >
      {event.color === "image-text" ? (
        /* Image Card Layout */
        <div className="flex flex-col h-full justify-between gap-1.5 text-left">
          <div>
            {event.tag && (
              <span
                className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mb-1.5 ${
                  event.tag.type === "pink"
                    ? "bg-[#f25c88]/15 text-[#f25c88]"
                    : "bg-blue-500/15 text-blue-600"
                }`}
              >
                {event.tag.text}
              </span>
            )}
            <h3 className="text-[13px] font-extrabold text-zinc-950 leading-tight">
              {event.title}
            </h3>
            {event.description && (
              <p className="text-[10px] text-zinc-500 mt-1 leading-snug font-medium line-clamp-3">
                {event.description}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 mt-auto w-full">
            {event.image && (
              <div className="relative w-full h-[65px] rounded-xl overflow-hidden mt-1 bg-zinc-200">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover grayscale-[20%] contrast-[105%]"
                />
              </div>
            )}
            {event.status === "joinable" && (
              <button className="w-full py-1.5 bg-[#121212] hover:bg-zinc-800 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer text-center">
                Join
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Standard Calendar Card Layout */
        <div className="flex flex-col h-full justify-between gap-1 text-left">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className={`p-1.5 rounded-full flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.03)] ${getIconBgClass(event.title, event.color)}`}>
                {getCardIcon(event.title, event.color)}
              </div>
              {event.status === "in-progress" && (
                <span className="bg-[#f25c88] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                  In progress..
                </span>
              )}
            </div>

            <h3 className="text-[12px] font-bold text-zinc-900 leading-tight mt-1.5">
              {event.title}
            </h3>

            {/* Lecturer row if available */}
            {lecturerName && (
              <span className="text-[9px] text-zinc-400 font-semibold mt-0.5">
                {lecturerName}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5 mt-auto">
            {event.link && (
              <div className="flex items-center gap-1 text-[9px] text-amber-900 font-semibold hover:underline">
                <FileDown className="w-3 h-3" />
                <span>{event.link.text}</span>
              </div>
            )}

            {event.participants && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="flex -space-x-1.5 overflow-hidden">
                  {event.participants.initials.slice(0, 3).map((init, i) => (
                    <div
                      key={`${init}-${i}`}
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[8px] font-bold text-zinc-800 bg-[#FAF7F2] border border-white"
                    >
                      {init}
                    </div>
                  ))}
                  {event.participants.count > 3 && (
                    <div className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[8px] font-bold text-white bg-blue-500 border border-white">
                      +{event.participants.count - 3}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between w-full mt-1 border-t border-black/[0.04] pt-1">
              {/* Room details */}
              {event.subtitle ? (
                <div className="flex items-center gap-0.5 text-[9px] text-zinc-500 font-bold truncate max-w-[50%]">
                  <MapPin className="w-3 h-3 text-zinc-400" />
                  <span className="truncate">{event.subtitle}</span>
                </div>
              ) : (
                <div />
              )}
              {/* Timings / Actions */}
              <div className="flex items-center gap-1">
                <Clock className="w-2.5 h-2.5 text-zinc-400" />
                <span className="text-[9.5px] text-zinc-500 font-bold">
                  {event.timeStart}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
