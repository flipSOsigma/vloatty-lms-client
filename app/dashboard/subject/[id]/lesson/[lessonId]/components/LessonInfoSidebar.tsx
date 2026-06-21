"use client";

import React from "react";
import { Lesson, Module, Subject } from "@/types/subject";
import { StorageTracker } from "@/components/ui/StorageTracker";
import { formatDate } from "@/lib/formatters";
import { Lock, Unlock, GraduationCap, Lightbulb } from "lucide-react";

interface LessonInfoSidebarProps {
  lesson: Lesson;
  module: Module;
  subject: Subject;
}

export default function LessonInfoSidebar({
  lesson,
  module,
  subject,
}: LessonInfoSidebarProps) {
  return (
    <div className="lg:col-span-1 flex flex-col gap-6 lg:sticky lg:top-0 lg:order-1">
      <div className="flex flex-col gap-5 w-full">
        <div className="flex flex-col gap-1.5">
          <span
            className="inline-block text-[9px] font-bold px-3 py-1 rounded-full w-fit bg-[#facc15]/10 text-[#d97706] border border-[#f97316]/20"
          >
            {lesson.type || "learning"}
          </span>
          {lesson.type !== "learning" && (
            <>
              <h2 className="text-2xl font-black text-[#121212] tracking-tight mt-2 leading-tight">
                {lesson.title}
              </h2>
              <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider mt-0.5">
                Module: {module.title}
              </span>
              <div className="flex items-center gap-1.5 text-zinc-500 font-semibold text-[13px] mt-1.5">
                <GraduationCap className="w-4 h-4 text-zinc-400" />
                <span>Lecturers: {subject.lecturers.map((l) => l.name).join(", ")}</span>
              </div>
            </>
          )}
        </div>

        {lesson.type !== "learning" && lesson.desc && (
          <p className="text-[12px] text-zinc-500 leading-relaxed font-medium bg-[#FAF7F2]/50 p-4 border border-[#E5E1D8]/30 rounded-2xl">
            {lesson.desc}
          </p>
        )}

        <div className="flex flex-col gap-4 pt-4 border-t border-[#E5E1D8]/45 text-left">
          <span className="text-[11px] font-black text-zinc-800 uppercase tracking-wider mb-1">
            Lesson Details
          </span>
          <div className="flex flex-col gap-3.5">
            <div className="flex flex-col items-start gap-0.5 bg-transparent p-0 border-none">
              <span className="text-[9.5px] font-extrabold text-zinc-400 uppercase tracking-wider">Subject</span>
              <span className="text-zinc-850 text-[12.5px] font-bold">{subject.name}</span>
            </div>
            <div className="flex flex-col items-start gap-0.5 bg-transparent p-0 border-none">
              <span className="text-[9.5px] font-extrabold text-zinc-400 uppercase tracking-wider">Module</span>
              <span className="text-zinc-850 text-[12.5px] font-bold">{module.title}</span>
            </div>
            <div className="flex flex-col items-start gap-0.5 bg-transparent p-0 border-none">
              <span className="text-[9.5px] font-extrabold text-zinc-400 uppercase tracking-wider">Lesson Type</span>
              <span className="text-[12.5px] font-extrabold uppercase text-[#d97706]">
                {lesson.type === "learning"
                  ? "Learning Material"
                  : lesson.type === "assignment"
                  ? "Assignment"
                  : lesson.type === "quizzes"
                  ? "Quiz"
                  : "Presence Session"}
              </span>
            </div>
            <div className="flex flex-col items-start gap-0.5 bg-transparent p-0 border-none">
              <span className="text-[9.5px] font-extrabold text-zinc-400 uppercase tracking-wider">Lecturers</span>
              <span
                className="text-zinc-850 text-[12.5px] font-bold"
                title={subject.lecturers.map((l) => l.name).join(", ")}
              >
                {subject.lecturers.map((l) => l.name).join(", ")}
              </span>
            </div>
            {lesson.type !== "learning" && (
              <>
                <div className="flex flex-col items-start gap-0.5 bg-transparent p-0 border-none">
                  <span className="text-[9.5px] font-extrabold text-zinc-400 uppercase tracking-wider">Open Date</span>
                  <span className="text-zinc-855 text-[12.5px] font-bold">{formatDate(lesson.openDate)}</span>
                </div>
                <div className="flex flex-col items-start gap-0.5 bg-transparent p-0 border-none">
                  <span className="text-[9.5px] font-extrabold text-zinc-400 uppercase tracking-wider">Due Date</span>
                  <span className="text-zinc-855 text-[12.5px] font-bold">{formatDate(lesson.closeDate)}</span>
                </div>
                <div className="flex flex-col items-start gap-0.5 bg-transparent p-0 border-none">
                  <span className="text-[9.5px] font-extrabold text-zinc-400 uppercase tracking-wider">Deadline Policy</span>
                  <span className="text-zinc-855 text-[12.5px] font-bold flex items-center gap-1.5 mt-0.5">
                    {lesson.closeType === "restrict" ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-[#d97706]" /> Strict Deadline
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-emerald-600" /> Open Submission
                      </>
                    )}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#EBE8E0] rounded-3xl p-6 shadow-sm flex flex-col gap-4">
        <h3 className="text-[13px] font-bold text-[#121212] flex items-center gap-2 pb-2 border-b border-zinc-100">
          <Lightbulb className="w-4 h-4 text-[#d97706]" />
          Resource Tips
        </h3>
        <p className="text-[11px] text-zinc-500 leading-relaxed font-semibold">
          Use your desktop or mobile device to upload files directly. Submissions are tracked
          and recorded automatically. (Max 200 MB storage quota)
        </p>
      </div>

      {subject.institutionId && (
        <StorageTracker institutionId={subject.institutionId} />
      )}
    </div>
  );
}
