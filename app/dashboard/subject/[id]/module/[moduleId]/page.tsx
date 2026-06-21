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

      <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-6 flex flex-col gap-6 text-left select-none w-full">
        <div className="flex items-center justify-between mt-1">
          <Link
            href={`/dashboard/subject/${selectedSubject.id}`}
            className="w-10 h-10 rounded-full border border-[#E5E1D8]/70 hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition-all cursor-pointer bg-white shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <span className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider">
            Module Overview
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start text-left">
          <div className="lg:col-span-1 flex flex-col gap-6 lg:sticky lg:top-0">
            <div className="bg-white border border-[#E5E1D8]/70 rounded-3xl shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <span
                  className="inline-block text-[9px] font-bold px-3 py-1 rounded-full w-fit"
                  style={{
                    backgroundColor: "#facc1515",
                    color: "#facc15",
                    border: "1px solid #facc1530"
                  }}
                >
                  {selectedSubject.name}
                </span>
                <h2 className="text-[34px] font-semibold text-zinc-800 tracking-tight leading-none mt-1">
                  {selectedModule.title}
                </h2>
                <div className="flex items-center gap-1.5 text-zinc-500 font-semibold text-[13px] mt-1">
                  <Calendar className="w-4 h-4" />
                  <span>Start Date: {formatDate(selectedModule.date)}</span>
                </div>
              </div>

              {selectedModule.desc && (
                <p className="text-[12px] text-zinc-500 leading-relaxed font-medium bg-zinc-50 p-4 border border-[#E5E1D8]/70 rounded-2xl">
                  {selectedModule.desc}
                </p>
              )}

              <div className="flex flex-col gap-2 pt-2 border-t border-[#E5E1D8]/70">
                <span className="text-[10px] font-semibold text-zinc-800 uppercase tracking-wider mb-1">
                  Module Summary
                </span>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[12px] font-semibold text-zinc-800 bg-zinc-50 px-3.5 py-2 border border-[#E5E1D8]/70 rounded-xl">
                    <span>Total Lessons</span>
                    <span className="text-zinc-500 text-[11px]">{lessonsCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-[12px] font-semibold text-zinc-800 bg-zinc-50 px-3.5 py-2 border border-[#E5E1D8]/70 rounded-xl">
                    <span>Learning Lessons</span>
                    <span className="text-zinc-500 text-[11px]">{learningCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-[12px] font-semibold text-zinc-800 bg-zinc-50 px-3.5 py-2 border border-[#E5E1D8]/70 rounded-xl">
                    <span>Assignments</span>
                    <span className="text-zinc-500 text-[11px]">{assignmentCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-[12px] font-semibold text-zinc-800 bg-zinc-50 px-3.5 py-2 border border-[#E5E1D8]/70 rounded-xl">
                    <span>Quizzes</span>
                    <span className="text-zinc-500 text-[11px]">{quizCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-semibold text-zinc-800 tracking-tight">
                Lessons inside this Module
              </h3>
              {canEdit && (
                <Link
                  href={`/dashboard/subject/${selectedSubject.id}/lesson/create?moduleId=${selectedModule.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5E1D8]/70 text-zinc-700 hover:text-zinc-800 font-semibold text-[11px] cursor-pointer transition-all bg-white"
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
                      <div className="absolute left-0 -translate-x-1/2 top-[6px] w-3 h-3 rounded-full border-2 border-zinc-50 bg-[#facc15] z-10 shadow-sm" />
                      {idx < sortedLessons.length - 1 && (
                        <div className="absolute left-0 top-[12px] bottom-[-40px] w-[2px] bg-zinc-300 -translate-x-1/2 z-0" />
                      )}
                      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        <div className="flex flex-col items-start gap-1.5">
                          <span className="p-1 bg-zinc-800 rounded text-white text-[9px] font-semibold uppercase tracking-wide w-fit">
                            {lesson.type || "learning"}
                          </span>
                          <h4 className="text-[14px] font-semibold text-zinc-800 truncate">
                            {lesson.title}
                          </h4>
                        </div>
                        <p className="text-[11.5px] text-zinc-500 leading-relaxed font-medium line-clamp-2">
                          {lesson.desc}
                        </p>
                      </div>

                      <Link
                        href={`/dashboard/subject/${selectedSubject.id}/lesson/${lesson.id}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E5E1D8]/70 text-zinc-700 hover:text-zinc-800 font-semibold text-[11px] cursor-pointer transition-all bg-white w-fit shrink-0"
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
