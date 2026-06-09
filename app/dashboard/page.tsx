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
    subject.lecturers.some((l) => l.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (subject.description && subject.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );



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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredSubjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
              />
            ))}
          </div>
        )}
      </div>

      {/* Interactive Modal */}
      <EventModal />
    </>
  );
}
