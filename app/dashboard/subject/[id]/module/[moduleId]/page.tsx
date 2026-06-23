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
      <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-6 flex flex-col gap-6 text-left select-none w-full">
        <Header />
        <div className="w-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-[#E5E1D8]/70 rounded-3xl p-6 bg-white/10 select-none">
          <span className="text-[14px] text-zinc-400 font-semibold">Module not found.</span>
          <Link
            href="/dashboard"
            className="mt-4 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-[11px] font-semibold text-white shadow-sm transition-all"
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

      <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-6 flex flex-col gap-8 text-left select-none w-full">
        {/* Header section matching lesson/create */}
        <div className="flex items-center gap-3 mt-1">
          <Link
            href={`/dashboard/subject/${selectedSubject.id}`}
            className="w-10 h-10 rounded-full border border-[#E5E1D8]/70 hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition-all cursor-pointer bg-white shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-[34px] font-semibold text-zinc-800 tracking-tight leading-none">
              {selectedModule.title}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start w-full">
          {/* Left Column: Lessons List (col-span-7) matching lesson/create's form column */}
          <div className="lg:col-span-7 flex flex-col gap-6 w-full lg:pl-[53px]">
            <div className="flex items-center justify-between border-b border-[#E5E1D8]/50 pb-3">
              <h3 className="text-[15px] font-semibold text-zinc-800 tracking-tight">
                Lessons inside this Module
              </h3>
              {canEdit && (
                <Link
                  href={`/dashboard/subject/${selectedSubject.id}/lesson/create?moduleId=${selectedModule.id}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#E5E1D8] text-zinc-700 hover:text-zinc-850 hover:bg-zinc-50 font-bold text-[11px] cursor-pointer transition-all bg-white shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Lesson</span>
                </Link>
              )}
            </div>

            {!selectedModule.lessons || selectedModule.lessons.length === 0 ? (
              <div className="w-full h-48 flex items-center justify-center border border-dashed border-[#E5E1D8] rounded-3xl bg-transparent">
                <span className="text-[13px] text-zinc-400 font-semibold">No lessons registered under this module.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-8 ml-2 mt-4 pb-2">
                {(() => {
                  const sortedLessons = [...selectedModule.lessons].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                  return sortedLessons.map((lesson, idx) => (
                    <div
                      key={lesson.id}
                      className="relative pl-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4 w-full"
                    >
                      <div className="absolute left-0 -translate-x-1/2 top-[7px] w-2.5 h-2.5 rounded-full border border-zinc-50 bg-[#facc15] z-10" />
                      {idx < sortedLessons.length - 1 && (
                        <div className="absolute left-0 top-[12px] bottom-[-32px] w-[1px] bg-[#E5E1D8] -translate-x-1/2 z-0" />
                      )}
                      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        <div className="flex flex-col items-start gap-1.5">
                          <span className="px-2 py-0.5 bg-zinc-800 rounded-full text-white text-[9px] font-semibold uppercase tracking-wide w-fit">
                            {lesson.type || "learning"}
                          </span>
                          <h4 className="text-[14.5px] font-semibold text-zinc-850 truncate">
                            {lesson.title}
                          </h4>
                        </div>
                        <p className="text-[11.5px] text-zinc-500 leading-relaxed font-medium line-clamp-2">
                          {lesson.desc}
                        </p>
                      </div>

                      <Link
                        href={`/dashboard/subject/${selectedSubject.id}/lesson/${lesson.id}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#E5E1D8] hover:bg-zinc-100 text-zinc-705 hover:text-zinc-850 font-bold text-[11px] cursor-pointer transition-all bg-white shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] w-fit shrink-0 self-start"
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

          {/* Right Column: Module info details & Summary stats (col-span-5) matching lesson/create's sidebar */}
          <div className="lg:col-span-5 flex flex-col gap-8 sticky top-6 text-left self-start w-full lg:border-l lg:border-[#E5E1D8]/45 lg:pl-10">
            <div className="flex flex-col gap-5 w-full">
              <div className="flex flex-col gap-1 pb-1">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Target Subject
                </span>
                <span
                  className="inline-block text-[9px] font-bold px-3 py-1 rounded-full w-fit mb-2"
                  style={{
                    backgroundColor: "#facc1515",
                    color: "#facc15",
                    border: "1px solid #facc1530",
                  }}
                >
                  {selectedSubject.room || "Room Online"}
                </span>
                <h2 className="text-[18px] font-semibold text-zinc-800 tracking-tight leading-tight">
                  {selectedSubject.name}
                </h2>
                <div className="flex items-center gap-1.5 text-zinc-500 font-semibold text-[11px] mt-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Start Date: {formatDate(selectedModule.date)}</span>
                </div>
              </div>

              {selectedModule.desc && (
                <p className="text-[11.5px] text-zinc-500 leading-relaxed font-medium">
                  {selectedModule.desc}
                </p>
              )}

              <div className="flex flex-col gap-2 pt-2 border-t border-[#E5E1D8]/40 mt-1">
                <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">
                  Module Summary
                </span>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[11.5px] font-semibold text-zinc-700 bg-transparent py-1.5 px-0.5 border-b border-[#E5E1D8]/30 last:border-b-0">
                    <span className="truncate pr-2">Total Lessons</span>
                    <span className="text-zinc-850 font-bold">{lessonsCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11.5px] font-semibold text-zinc-700 bg-transparent py-1.5 px-0.5 border-b border-[#E5E1D8]/30 last:border-b-0">
                    <span className="truncate pr-2">Learning Lessons</span>
                    <span className="text-zinc-850 font-bold">{learningCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11.5px] font-semibold text-zinc-700 bg-transparent py-1.5 px-0.5 border-b border-[#E5E1D8]/30 last:border-b-0">
                    <span className="truncate pr-2">Assignments</span>
                    <span className="text-zinc-850 font-bold">{assignmentCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11.5px] font-semibold text-zinc-700 bg-transparent py-1.5 px-0.5 border-b border-[#E5E1D8]/30 last:border-b-0">
                    <span className="truncate pr-2">Quizzes</span>
                    <span className="text-zinc-850 font-bold">{quizCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info / Guidelines matching lesson/create */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[13px] font-semibold text-zinc-850 flex items-center gap-2 pb-1">
                <Info className="w-4.5 h-4.5 text-[#d97706]" />
                Module Details
              </h3>

              <div className="flex flex-col gap-4 text-[12px] text-zinc-650 font-medium">
                <div className="flex gap-2.5 items-start bg-[#facc15]/5 p-3.5 rounded-2xl border border-[#facc15]/20 text-zinc-800">
                  <Calendar className="w-4 h-4 text-[#d97706] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[11.5px] block text-[#d97706] mb-0.5">Timeline</span>
                    This module commenced on {formatDate(selectedModule.date)}. All registered lessons belong to this phase of the subject syllabus.
                  </div>
                </div>

                <div className="flex gap-2.5 items-start bg-white/50 p-3.5 rounded-2xl border border-[#E5E1D8]/70">
                  <BookOpen className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-zinc-850 mb-0.5">Syllabus Structure</span>
                    Modules organize course components like reading materials, assignments, and assessment quizzes into clear thematic steps.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
