"use client";

import React from "react";
import Header from "../../components/views/Header";
import SubjectCard from "../../components/ui/SubjectCard";
import EventModal from "../../components/views/EventModal";
import { useLms } from "../../context/LmsContext";

export default function DashboardPage() {
  const { subjects, searchQuery } = useLms();

  const filteredSubjects = subjects.filter((subject) =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.lecturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (subject.description && subject.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getSubjectMeta = (id: string) => {
    switch (id) {
      case "s1":
        return { progress: 68, classCount: 12 };
      case "s2":
        return { progress: 45, classCount: 8 };
      case "s3":
        return { progress: 85, classCount: 16 };
      case "s4":
        return { progress: 30, classCount: 6 };
      case "s5":
        return { progress: 95, classCount: 10 };
      case "s6":
        return { progress: 50, classCount: 14 };
      case "s7":
        return { progress: 40, classCount: 6 };
      case "s8":
        return { progress: 60, classCount: 8 };
      default:
        return { progress: 0, classCount: 4 };
    }
  };

  return (
    <>
      {/* Header Panel */}
      <Header />

      {/* Subject Cards Grid View */}
      <div className="flex-1 overflow-y-auto pr-1 pb-4 flex flex-col gap-4 text-left select-none">
        <h2 className="text-[17px] font-extrabold text-[#121212] tracking-tight">
          My Subjects
        </h2>
        
        {filteredSubjects.length === 0 ? (
          <div className="w-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-[#E5E1D8] rounded-3xl p-6 bg-white/10">
            <span className="text-[14px] text-zinc-400 font-semibold">No subjects matched your search.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredSubjects.map((subject) => {
              const meta = getSubjectMeta(subject.id);
              return (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  progress={meta.progress}
                  classCount={meta.classCount}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Modal */}
      <EventModal />
    </>
  );
}
