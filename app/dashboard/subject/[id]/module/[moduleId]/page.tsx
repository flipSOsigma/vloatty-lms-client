"use client";

import React from "react";
import Header from "../../../../../../components/views/Header";
import { useLms } from "../../../../../../context/LmsContext";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  BookOpen,
  ArrowRight,
  Info,
  Clock,
  CheckCircle,
  FileText,
  HelpCircle,
  Plus,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string; moduleId: string }>;
}

const formatDate = (isoString: string) => {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (e) {
    return isoString;
  }
};

export default function ModuleDetailPage({ params }: PageProps) {
  const { id, moduleId } = React.use(params);
  const { subjects, currentUser } = useLms();

  const selectedSubject = subjects.find((s) => s.id === id);
  const selectedModule = selectedSubject?.modules.find((m) => m.id === moduleId);

  const isCreator = selectedSubject && currentUser?.id === selectedSubject.createdBy;
  const isLecturer = selectedSubject && selectedSubject.lecturers.some((l) => l.userId === currentUser?.id);
  const canEdit = isCreator || isLecturer;

  if (!selectedSubject || !selectedModule) {
    return (
      <div className="flex flex-col gap-6 text-left animate-in fade-in duration-300">
        <Header />
        <div className="w-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-[#E5E1D8] rounded-3xl p-6 bg-white/10 select-none">
          <span className="text-[14px] text-zinc-400 font-semibold">Module not found.</span>
          <Link
            href="/dashboard"
            className="mt-4 px-5 py-2.5 bg-[#121212] text-white font-bold rounded-full text-[12px] shadow-sm hover:bg-zinc-800 transition-colors"
          >
            Go back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const lessonsCount = selectedModule.lessons ? selectedModule.lessons.length : 0;
  const learningCount = selectedModule.lessons ? selectedModule.lessons.filter((l) => l.type === "learning").length : 0;
  const assignmentCount = selectedModule.lessons ? selectedModule.lessons.filter((l) => l.type === "assignment").length : 0;
  const quizCount = selectedModule.lessons ? selectedModule.lessons.filter((l) => l.type === "quizzes").length : 0;

  return (
    <>
      <Header />

      <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-4 flex flex-col gap-6 select-none animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between mt-1">
          <Link
            href={`/dashboard/subject/${selectedSubject.id}`}
            className="flex items-center gap-1.5 px-4 py-2 border border-[#E5E1D8] rounded-full hover:bg-zinc-100 font-bold text-[12px] text-zinc-700 cursor-pointer transition-colors shadow-sm bg-white/50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Subject</span>
          </Link>

          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Module Overview
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start text-left">
          <div className="lg:col-span-1 flex flex-col gap-6 lg:sticky lg:top-0">
            <div className="bg-white/40 border border-[#E5E1D8]/60 p-6 rounded-3xl flex flex-col gap-5 shadow-sm">
              <div className="flex flex-col gap-1">
                <span
                  className="inline-block text-[9px] font-bold px-3 py-1 rounded-full w-fit"
                  style={{
                    backgroundColor: "#f25c8815",
                    color: "#f25c88",
                    border: "1px solid #f25c8830"
                  }}
                >
                  {selectedSubject.name}
                </span>
                <h2 className="text-2xl font-black text-[#121212] tracking-tight mt-2 leading-tight">
                  {selectedModule.title}
                </h2>
                <div className="flex items-center gap-1.5 text-zinc-500 font-semibold text-[13px] mt-1">
                  <Calendar className="w-4 h-4" />
                  <span>Start Date: {formatDate(selectedModule.date)}</span>
                </div>
              </div>

              {selectedModule.desc && (
                <p className="text-[12px] text-zinc-500 leading-relaxed font-medium bg-[#FAF7F2]/50 p-4 border border-[#E5E1D8]/30 rounded-2xl">
                  {selectedModule.desc}
                </p>
              )}

              <div className="flex flex-col gap-2 pt-2 border-t border-[#E5E1D8]/40">
                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1">
                  Module Summary
                </span>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[12px] font-bold text-zinc-700 bg-[#FAF7F2]/50 px-3.5 py-2 border border-[#E5E1D8]/30 rounded-xl">
                    <span>Total Lessons</span>
                    <span className="text-zinc-500 text-[11px]">{lessonsCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-[12px] font-bold text-zinc-700 bg-[#FAF7F2]/50 px-3.5 py-2 border border-[#E5E1D8]/30 rounded-xl">
                    <span>Learning Lessons</span>
                    <span className="text-zinc-500 text-[11px]">{learningCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-[12px] font-bold text-zinc-700 bg-[#FAF7F2]/50 px-3.5 py-2 border border-[#E5E1D8]/30 rounded-xl">
                    <span>Assignments</span>
                    <span className="text-zinc-500 text-[11px]">{assignmentCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-[12px] font-bold text-zinc-700 bg-[#FAF7F2]/50 px-3.5 py-2 border border-[#E5E1D8]/30 rounded-xl">
                    <span>Quizzes</span>
                    <span className="text-zinc-500 text-[11px]">{quizCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-extrabold text-[#121212] tracking-tight">
                Lessons inside this Module
              </h3>
              {canEdit && (
                <Link
                  href={`/dashboard/subject/${selectedSubject.id}/lesson/create?moduleId=${selectedModule.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E5E1D8] hover:bg-zinc-100 font-bold text-[11px] text-[#f25c88] cursor-pointer transition-colors shadow-sm bg-white/50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Lesson</span>
                </Link>
              )}
            </div>

            {!selectedModule.lessons || selectedModule.lessons.length === 0 ? (
              <div className="w-full h-48 flex items-center justify-center border-2 border-dashed border-[#E5E1D8] rounded-3xl">
                <span className="text-[13px] text-zinc-400 font-semibold">No lessons registered under this module.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-8 ml-2.5 mt-4 pb-2">
                {(() => {
                  const sortedLessons = [...selectedModule.lessons].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                  return sortedLessons.map((lesson, idx) => (
                    <div
                      key={lesson.id}
                      className="relative pl-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full"
                    >
                      <div className="absolute left-0 -translate-x-1/2 top-[6px] w-3 h-3 rounded-full border-2 border-[#FAF7F2] bg-[#f25c88] z-10 shadow-sm" />
                      {idx < sortedLessons.length - 1 && (
                        <div className="absolute left-0 top-[12px] bottom-[-40px] w-[2px] bg-zinc-300 -translate-x-1/2 z-0" />
                      )}
                      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        <div className="flex flex-col items-start gap-1.5">
                          <span className="p-1 bg-[#121212] rounded text-white text-[9px] font-bold uppercase tracking-wide w-fit">
                            {lesson.type || "learning"}
                          </span>
                          <h4 className="text-[14px] font-bold text-zinc-950 truncate">
                            {lesson.title}
                          </h4>
                        </div>
                        <p className="text-[11.5px] text-zinc-500 leading-relaxed font-medium line-clamp-2">
                          {lesson.desc}
                        </p>
                      </div>

                      <Link
                        href={`/dashboard/subject/${selectedSubject.id}/lesson/${lesson.id}`}
                        className="flex items-center gap-1.5 px-4 py-2 border border-[#E5E1D8] rounded-full hover:bg-white font-bold text-[11px] text-zinc-700 cursor-pointer transition-colors shadow-sm bg-white/40 w-fit shrink-0"
                      >
                        <span>Go to Lesson</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
