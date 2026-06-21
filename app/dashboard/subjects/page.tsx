"use client";

import React, { useState } from "react";
import Header from "../../../components/views/Header";
import SubjectCard from "../../../components/ui/SubjectCard";
import { useLms } from "../../../context/LmsContext";
import Link from "next/link";
import { Plus, Grid2x2Plus, Grid2x2X, BookOpen } from "lucide-react";

export default function SubjectsPage() {
  const { subjects, searchQuery, currentUser } = useLms();
  const [cols, setCols] = useState(3);

  const mySubjects = subjects.filter(
    (subj) =>
      subj.createdBy === currentUser?.id ||
      subj.lecturers?.some((l) => l.userId === currentUser?.id) ||
      subj.participants?.some((p) => p.userId === currentUser?.id)
  );

  const filteredSubjects = mySubjects.filter((subject) =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.lecturers.some((l) => l.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (subject.description && subject.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getGridColsClass = (colCount: number) => {
    switch (colCount) {
      case 2:
        return "grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-300";
      case 3:
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-300";
      case 4:
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-300";
      case 5:
        return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-in fade-in duration-300";
      default:
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-300";
    }
  };

  return (
    <>
      <Header title="My Subjects" subtitle="Academics" />

      <div className="flex-1 overflow-y-auto pr-1 pb-6 flex flex-col gap-6 text-left select-none w-full no-scrollbar">
        <div className="w-full px-2 md:px-4 flex flex-col gap-6">
          <div className="flex justify-end items-center gap-3 w-full mb-1">
            <Link
              href="/dashboard/subject/create"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl text-[11px] cursor-pointer transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Subject</span>
            </Link>

            <div className="flex items-center gap-1 bg-white border border-[#E5E1D8]/70 p-1 rounded-xl shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] shrink-0">
              <button
                onClick={() => setCols((prev) => Math.max(2, prev - 1))}
                disabled={cols <= 2}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-90 cursor-pointer"
              >
                <Grid2x2X className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-semibold text-zinc-500 px-1 select-none">
                {cols}
              </span>
              <button
                onClick={() => setCols((prev) => Math.min(5, prev + 1))}
                disabled={cols >= 5}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-90 cursor-pointer"
              >
                <Grid2x2Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        {filteredSubjects.length === 0 ? (
          <div className="w-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-[#E5E1D8]/70 rounded-3xl p-6 bg-white/40">
            <BookOpen className="w-8 h-8 text-zinc-300 mb-2" />
            <span className="text-[13px] font-semibold text-zinc-400">No subjects found.</span>
            <Link
              href="/dashboard/subject/create"
              className="mt-3 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl text-[10.5px]"
            >
              Create your first subject
            </Link>
          </div>
        ) : (
          <div className={getGridColsClass(cols)}>
            {filteredSubjects.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        )}
        </div>
      </div>
    </>
  );
}
