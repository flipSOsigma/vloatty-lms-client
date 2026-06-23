"use client";

import React, { useState, useMemo } from "react";
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

  const getSubjectColorHex = (colorName: string | undefined) => {
    switch (colorName) {
      case "yellow": return "#facc15";
      case "blue": return "#3b82f6";
      case "green": return "#10b981";
      case "pink": return "#ec4899";
      case "orange": return "#f97316";
      case "purple": return "#818cf8";
      default: return "#facc15";
    }
  };

  const subjectColor = getSubjectColorHex(subject.color);
  const isHexColor = true;

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

  const totalLessons = useMemo(() => {
    let count = 0;
    subject.modules?.forEach((m) => {
      count += m.lessons?.length || 0;
    });
    return count;
  }, [subject.modules]);

  const classmatesCount = subject.participants?.length || 0;
  const modulesCount = subject.modules?.length || 0;

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
        className="group p-5 bg-white border border-[#EFECE6] rounded-[32px] hover:border-zinc-300 hover:shadow-xs cursor-pointer select-none flex flex-col justify-between text-left h-[250px] relative transition-all duration-300 hover:-translate-y-1"
        style={{
          boxShadow: `0 8px 24px ${hexToRgba(subjectColor, 0.025)}`,
        }}
      >
        {/* Header row: Lecturer name (left) & More options button (right) */}
        <div className="flex justify-between items-center w-full relative z-10">
          <span className="text-[10px] font-extrabold text-zinc-400 leading-normal tracking-wide">
            {subject.lecturers[0]?.name || "Lecturer"}
          </span>
          <button
            onClick={handleMoreClick}
            className="w-7 h-7 rounded-full bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/60 flex items-center justify-center text-zinc-500 cursor-pointer transition-colors"
            title="More options"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Middle Content block: Room badge, Subject name, Subject description */}
        <div className="flex flex-col gap-1.5 mt-2 flex-grow justify-center relative z-10">
          {subject.room && (
            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md self-start leading-normal ${
              subject.color === "yellow" ? "text-[#d97706] bg-[#facc15]/15" :
              subject.color === "blue" ? "text-blue-700 bg-blue-500/10" :
              subject.color === "green" ? "text-emerald-700 bg-emerald-500/10" :
              subject.color === "pink" ? "text-[#be185d] bg-[#ec4899]/10" :
              subject.color === "orange" ? "text-orange-700 bg-orange-500/10" :
              subject.color === "purple" ? "text-indigo-700 bg-indigo-500/10" :
              "text-[#d97706] bg-[#facc15]/15"
            }`}>
              {subject.room}
            </span>
          )}

          <h3 className="text-[18px] font-black text-zinc-955 tracking-tight mt-1 truncate">
            {subject.name}
          </h3>

          <p className="text-[11.5px] font-semibold text-zinc-500 leading-relaxed line-clamp-2" title={subject.description}>
            {subject.description || "Explore syllabus details, learning resources, and assignments."}
          </p>
        </div>

        {/* Footer row: separator line, stats, & entry arrow trigger */}
        <div className="flex items-center justify-between border-t border-zinc-100 pt-3 mt-2 text-[10.5px] font-bold text-zinc-500 relative z-10 select-none">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span>{modulesCount} Modules</span>
            <span>&bull;</span>
            <span>{totalLessons} Lessons</span>
            <span>&bull;</span>
            <span>{classmatesCount} Students</span>
          </div>

          <div className="w-6 h-6 rounded-full bg-zinc-50 border border-zinc-200/50 group-hover:bg-[#121212] group-hover:text-white group-hover:border-[#121212] flex items-center justify-center transition-colors">
            <span className="text-[10px] font-black group-hover:translate-x-0.25 transition-all">➔</span>
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
