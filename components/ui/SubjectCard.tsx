"use client";

import React, { useState } from "react";
import { MoreHorizontal, BookOpen, Settings, RefreshCw } from "lucide-react";
import { Subject } from "../../types/subject";
import { useRouter } from "next/navigation";
import { useLms } from "../../context/LmsContext";
import ContextMenu from "./ContextMenu";

interface SubjectCardProps {
  subject: Subject;
}

export default function SubjectCard({ subject }: SubjectCardProps) {
  const router = useRouter();
  const { showToast } = useLms();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });


  let colorTheme = {
    bg: "bg-white",
    border: "border border-zinc-200/60",
    shadow: "hover:shadow-[0_20px_40px_rgba(18,18,18,0.04)]",
    logoBg: "bg-[#ECE8E0] text-zinc-800",
    tagBg: "bg-zinc-100/60 text-zinc-500",
  };

  if (subject.color === "yellow") {
    colorTheme = {
      bg: "bg-white",
      border: "border border-amber-200/60",
      shadow: "hover:shadow-[0_20px_40px_rgba(250,213,107,0.14)]",
      logoBg: "bg-[#FAD56B] text-amber-950",
      tagBg: "bg-amber-50/70 text-amber-800",
    };
  } else if (subject.color === "blue") {
    colorTheme = {
      bg: "bg-white",
      border: "border border-blue-200/60",
      shadow: "hover:shadow-[0_20px_40px_rgba(191,211,247,0.22)]",
      logoBg: "bg-[#BFD3F7] text-blue-950",
      tagBg: "bg-blue-50/70 text-blue-800",
    };
  } else if (subject.color === "image-text") {
    colorTheme = {
      bg: "bg-white",
      border: "border border-stone-200/60",
      shadow: "hover:shadow-[0_20px_40px_rgba(18,18,18,0.04)]",
      logoBg: "bg-[#121212] text-white",
      tagBg: "bg-stone-50 text-stone-600",
    };
  }

  const isHexColor = subject.color && subject.color.startsWith("#");

  const hexToRgba = (hex: string | undefined, opacity: number) => {
    if (!hex) return "";
    try {
      let c = hex.substring(1);
      if (c.length === 3) {
        c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
      }
      const r = parseInt(c.substring(0, 2), 16);
      const g = parseInt(c.substring(2, 4), 16);
      const b = parseInt(c.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    } catch (e) {
      return hex;
    }
  };

  const handleCardClick = () => {
    router.push(`/dashboard/subject/${subject.id}`);
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuOpen(!menuOpen);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuOpen(true);
  };

  const getSubjectInitial = () => {
    return subject.name.charAt(0).toUpperCase();
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        onContextMenu={handleContextMenu}
        className={`p-6 rounded-3xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:scale-[1.008] cursor-pointer select-none h-full text-left shadow-[0_4px_16px_rgba(0,0,0,0.008)] ${
          isHexColor ? "" : `${colorTheme.bg} ${colorTheme.border} ${colorTheme.shadow}`
        }`}
        style={
          isHexColor
            ? {
                backgroundColor: "#ffffff",
                border: `1px solid ${hexToRgba(subject.color, 0.15)}`,
                boxShadow: `0 10px 30px ${hexToRgba(subject.color, 0.05)}`,
              }
            : undefined
        }
      >
        <div className="flex flex-col gap-4.5 h-full w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[13.5px] flex-shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)] ${
                  isHexColor ? "" : colorTheme.logoBg
                }`}
                style={isHexColor ? { backgroundColor: subject.color, color: "#ffffff" } : undefined}
              >
                {getSubjectInitial()}
              </div>
              
              <div className="flex flex-col min-w-0">
                <h3 className="text-[14.5px] font-black text-zinc-950 tracking-tight truncate">
                  {subject.name}
                </h3>
                {subject.room && (
                  <span className="text-[11px] font-semibold text-zinc-400 truncate -mt-0.5">
                    {subject.room}
                  </span>
                )}
              </div>
            </div>
  
            <button
              onClick={handleMoreClick}
              className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer flex-shrink-0"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
  
          <div className="flex flex-col gap-1.5">
            {subject.schedules && subject.schedules.length > 0 && (
              <div
                className="flex flex-row overflow-x-auto gap-1.5 pl-0.5 py-0.5 w-full scrollbar-none"
                style={{ scrollbarWidth: "none" }}
              >
                {subject.schedules.map((sch, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center text-[9px] font-medium px-2.5 py-1 rounded-full border border-transparent flex-shrink-0 ${
                      isHexColor ? "" : colorTheme.tagBg
                    }`}
                    style={
                      isHexColor
                        ? {
                            backgroundColor: hexToRgba(subject.color, 0.08),
                            color: subject.color,
                            border: `1px solid ${hexToRgba(subject.color, 0.1)}`,
                          }
                        : undefined
                    }
                  >
                    {sch.day.substring(0, 3)} {sch.startTime} - {sch.endTime}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ContextMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        x={menuPos.x}
        y={menuPos.y}
        options={[
          {
            label: "View Syllabus",
            icon: BookOpen,
            onClick: () => router.push(`/dashboard/subject/${subject.id}`),
          },
          {
            label: "Manage Subject",
            icon: Settings,
            onClick: () => router.push(`/dashboard/subject/${subject.id}/manage`),
          },
          {
            label: "Sync Schedules",
            icon: RefreshCw,
            onClick: () => showToast(`${subject.name} schedules synced successfully!`, "success"),
          },
        ]}
      />
    </>
  );
}
