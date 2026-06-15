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

  const subjectColor = "#f25c88";
  const isHexColor = true;

  let colorTheme = {
    bg: "bg-white",
    border: "border border-zinc-200/60",
    shadow: "hover:shadow-[0_20px_40px_rgba(18,18,18,0.04)]",
    logoBg: "bg-[#ECE8E0] text-zinc-800",
    tagBg: "bg-zinc-100/60 text-zinc-500",
  };

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

  return (
    <>
      <div
        onClick={handleCardClick}
        onContextMenu={handleContextMenu}
        className={`group p-6 rounded-xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:scale-[1.008] cursor-pointer select-none h-full text-left shadow-[0_4px_16px_rgba(0,0,0,0.008)] relative overflow-hidden ${
          isHexColor ? "" : `${colorTheme.bg} ${colorTheme.border} ${colorTheme.shadow}`
        }`}
        style={
          isHexColor
            ? {
                backgroundColor: "#ffffff",
                border: `1px solid ${hexToRgba(subjectColor, 0.15)}`,
                boxShadow: `0 10px 30px ${hexToRgba(subjectColor, 0.05)}`,
              }
            : undefined
        }
      >
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
          style={{ backgroundImage: `url("${subject.thumbnail || "/Subject%20Card%20-%20Thumbnail.png"}")` }}
        >
          <div className="absolute inset-0 bg-black/45" />
        </div>

        <div className="flex flex-col justify-between h-full w-full gap-8 min-h-25 relative z-10">
          <div className="flex justify-end w-full">
            <button
              onClick={handleMoreClick}
              className="w-8 h-8 rounded-full hover:bg-zinc-100 group-hover:hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-zinc-700 group-hover:text-white/70 group-hover:hover:text-white transition-all cursor-pointer shrink-0"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col mt-auto">
            {subject.room && (
              <span className="text-[10.5px] font-medium text-zinc-950 group-hover:text-white/80 transition-colors duration-300">
                {subject.room}
              </span>
            )}
            <h3 className="text-lg font-black text-zinc-950 group-hover:text-white transition-colors duration-300 tracking-tight leading-snug line-clamp-2">
              {subject.name}
            </h3>
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
