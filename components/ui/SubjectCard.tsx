"use client";

import React from "react";
import { BookOpen, GraduationCap, MapPin, ArrowRight } from "lucide-react";
import { Subject } from "../../types/subject";
import { useRouter } from "next/navigation";

interface SubjectCardProps {
  subject: Subject;
  progress: number;
  classCount: number;
}

export default function SubjectCard({ subject, progress, classCount }: SubjectCardProps) {
  const router = useRouter();

  let colorTheme = {
    bg: "bg-[#ECE8E0]",
    border: "border-zinc-200/50",
    accent: "bg-[#f25c88]",
    text: "text-zinc-800",
    progressBg: "bg-zinc-300/40",
  };

  if (subject.color === "yellow") {
    colorTheme = {
      bg: "bg-[#FAD56B]/90",
      border: "border-amber-400/20",
      accent: "bg-[#121212]",
      text: "text-amber-950",
      progressBg: "bg-amber-950/20",
    };
  } else if (subject.color === "blue") {
    colorTheme = {
      bg: "bg-[#BFD3F7]/95",
      border: "border-blue-400/20",
      accent: "bg-[#4a72d4]",
      text: "text-blue-950",
      progressBg: "bg-blue-950/20",
    };
  } else if (subject.color === "image-text") {
    colorTheme = {
      bg: "bg-[#F3F0EA]",
      border: "border-[#E5E1D8]",
      accent: "bg-[#f25c88]",
      text: "text-zinc-800",
      progressBg: "bg-zinc-400/30",
    };
  }

  const handleCardClick = () => {
    router.push(`/dashboard/subject/${subject.id}`);
  };

  const handleScheduleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    router.push("/dashboard/schedule");
  };

  return (
    <div
      onClick={handleCardClick}
      className={`rounded-3xl p-6 flex flex-col justify-between border shadow-[0_4px_12px_rgba(0,0,0,0.015)] hover:shadow-[0_16px_32px_rgba(242,92,136,0.04)] hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 ${colorTheme.bg} ${colorTheme.border} group cursor-pointer select-none`}
    >
      <div className="flex flex-col gap-4 text-left">
        <div className="flex items-start justify-between">
          <div className="p-3 bg-white/60 rounded-2xl flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.03)] group-hover:bg-white transition-colors duration-300">
            <BookOpen className="w-5 h-5 text-[#121212]" />
          </div>
        </div>

        {/* Title and Lecturer */}
        <div className="flex flex-col gap-1 mt-1">
          <h3 className="text-[19px] font-extrabold text-[#121212] tracking-tight leading-snug">
            {subject.name}
          </h3>
          <div className="flex items-center gap-1.5 text-zinc-500 font-semibold text-[12px] mt-0.5">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{subject.lecturer}</span>
          </div>
        </div>

        {/* Description */}
        {subject.description && (
          <p className="text-[11.5px] text-zinc-500 font-medium leading-relaxed mt-1 line-clamp-3">
            {subject.description}
          </p>
        )}

        {/* Schedules */}
        {subject.schedules && subject.schedules.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {subject.schedules.map((sch, i) => (
              <span
                key={i}
                className="inline-flex items-center text-[9.5px] font-bold px-2.5 py-0.5 rounded-full bg-white/50 text-zinc-700 border border-zinc-200/30"
              >
                {sch.day.substring(0, 3)} {sch.startTime}-{sch.endTime}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Content */}
      <div className="flex flex-col gap-4 mt-6">
        <div className="flex items-center justify-between">
          {/* Room Location (No avatar stack anymore!) */}
          {subject.room ? (
            <div className="flex items-center gap-1 text-[11px] text-zinc-600 font-bold">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              <span>{subject.room}</span>
            </div>
          ) : (
            <div />
          )}

          {/* Navigate to Schedule Button */}
          <button
            onClick={handleScheduleClick}
            className={`flex items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer ${
              subject.color === "yellow" ? "bg-[#121212] text-white hover:bg-zinc-800" : "bg-white text-zinc-800 hover:bg-zinc-100"
            } shadow-[0_2px_4px_rgba(0,0,0,0.02)] group-hover:translate-x-0.5`}
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
