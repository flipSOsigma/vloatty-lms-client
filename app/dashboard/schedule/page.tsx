"use client";

import React, { useMemo } from "react";
import Header from "../../../components/views/Header";
import SubjectCard from "../../../components/ui/SubjectCard";
import { useLms } from "../../../context/LmsContext";
import { CalendarDays, Sparkles } from "lucide-react";

export default function SchedulePage() {
  const { subjects, currentUser } = useLms();

  // Filter subjects enrolled by user
  const mySubjects = useMemo(() => {
    if (!currentUser?.id) return [];
    return subjects.filter(
      (subj) =>
        subj.createdBy === currentUser?.id ||
        subj.lecturers?.some((l) => l.userId === currentUser?.id) ||
        subj.participants?.some((p) => p.userId === currentUser?.id)
    );
  }, [subjects, currentUser]);

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = new Date();
  const todayDayName = dayNames[today.getDay()];

  // Get chronological days of the week starting from Today
  const orderedDays = useMemo(() => {
    const todayIdx = dayNames.indexOf(todayDayName);
    const list = [];
    for (let i = 0; i < 7; i++) {
      list.push(dayNames[(todayIdx + i) % 7]);
    }
    return list;
  }, [todayDayName]);

  // Group subjects by day they are scheduled on
  const groupedSubjects = useMemo(() => {
    return orderedDays.map((dayName) => {
      const daySubjects = mySubjects.filter((subject) =>
        subject.schedules?.some((s) => s.day.toLowerCase() === dayName.toLowerCase())
      );
      return {
        day: dayName,
        isToday: dayName === todayDayName,
        subjects: daySubjects,
      };
    });
  }, [orderedDays, mySubjects, todayDayName]);

  // Filter groups: always show today (even if empty), but only show other days if they have subjects
  const activeGroups = useMemo(() => {
    return groupedSubjects.filter((g) => g.isToday || g.subjects.length > 0);
  }, [groupedSubjects]);

  return (
    <>
      <Header title="Daily Schedule" subtitle="Academics" />

      <div className="flex-1 overflow-y-auto pr-1 pb-6 flex flex-col gap-6 text-left select-none w-full no-scrollbar">
        <div className="w-full px-2 md:px-4 flex flex-col gap-6">
          {/* Title row */}
          <div className="flex flex-col text-left">
            <h1 className="text-lg sm:text-xl font-black text-zinc-955 tracking-tight">Schedule</h1>
          </div>

          {/* Grouped Day Lists */}
          <div className="flex flex-col gap-8 w-full">
            {activeGroups.map((group) => (
              <div key={group.day} className="flex flex-col gap-4 w-full animate-in fade-in duration-300">
                {/* Day Header Section */}
                <div className="flex items-center gap-3 border-b border-[#EFECE6]/50 pb-2">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    group.isToday 
                      ? "bg-[#121212] text-white" 
                      : "bg-[#FAF7F2] text-zinc-500 border border-[#EFECE6]"
                  }`}>
                    {group.isToday ? `Today (${group.day})` : group.day}
                  </span>
                  
                  {group.isToday && (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold text-[#d97706] bg-[#facc15]/10 px-2 py-0.5 rounded-md animate-pulse">
                      <Sparkles className="w-3 h-3" />
                      Active Session
                    </span>
                  )}
                </div>

                {/* Subjects Grid */}
                {group.subjects.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {group.subjects.map((subject) => (
                      <SubjectCard key={subject.id} subject={subject} />
                    ))}
                  </div>
                ) : (
                  // Empty State for Today if no classes are scheduled
                  <div className="flex flex-col items-center justify-center py-10 px-6 rounded-[32px] bg-[#FDFBF7] border border-dashed border-[#EFECE6] text-center gap-2 max-w-xl mx-auto w-full my-2">
                    <div className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-200/50 flex items-center justify-center text-zinc-400">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <h3 className="text-xs sm:text-[13px] font-black text-zinc-800 tracking-tight">
                      No classes scheduled
                    </h3>
                    <p className="text-[10px] sm:text-[11px] font-semibold text-zinc-400 max-w-xs leading-normal">
                      You have no subjects scheduled for today. Take some time to review your learning materials or plan ahead!
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
