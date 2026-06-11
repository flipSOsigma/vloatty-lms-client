"use client";

import React, { useState } from "react";
import Header from "../../components/views/Header";
import SubjectCard from "../../components/ui/SubjectCard";
import EventModal from "../../components/views/EventModal";
import { useLms } from "../../context/LmsContext";
import Link from "next/link";
import { Plus, Clock, MapPin, Globe, Compass } from "lucide-react";
import StudyActivityChart from "../../components/ui/CourseAnalyticsChart";

export default function DashboardPage() {
  const { subjects, searchQuery, currentUser, events, showToast } = useLms();
  const [selectedDiscoverCategory, setSelectedDiscoverCategory] = useState("All");
  const discoverCategories = ["All", "Lecture", "Lab", "Seminar", "Clinical", "Workshop"];

  const today = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayName = dayNames[today.getDay()];

  const todayClasses = subjects
    .flatMap((subj) => {
      if (!subj.schedules) return [];
      return subj.schedules
        .filter((sch) => sch.day.toLowerCase() === currentDayName.toLowerCase())
        .map((sch) => ({
          ...sch,
          subject: subj,
        }));
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const isClassActive = (startTime: string, endTime: string) => {
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;
    return currentMins >= startMins && currentMins <= endMins;
  };

  const filteredSubjects = subjects.filter((subject) =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.lecturers.some((l) => l.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (subject.description && subject.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const createdSubjects = filteredSubjects.filter(
    (subject) => subject.createdBy === currentUser?.id
  );
  
  const joinedSubjects = filteredSubjects.filter(
    (subject) =>
      subject.createdBy !== currentUser?.id &&
      subject.participants?.some((p) => p.userId === currentUser?.id)
  );

  const discoverableSubjects = filteredSubjects.filter(
    (subject) =>
      subject.isOpen &&
      subject.createdBy !== currentUser?.id &&
      !subject.participants?.some((p) => p.userId === currentUser?.id)
  );

  const filteredDiscoverable = discoverableSubjects.filter(
    (subject) =>
      selectedDiscoverCategory === "All" ||
      subject.category === selectedDiscoverCategory
  );


  const getEventHours = (event: any) => {
    try {
      const [sh, sm] = event.timeStart.split(":").map(Number);
      const [eh, em] = event.timeEnd.split(":").map(Number);
      return Math.max(0, (eh * 60 + em - (sh * 60 + sm)) / 60);
    } catch (e) {
      return 0;
    }
  };

  const totalHours = events.reduce((sum, event) => {
    if (event.dayIndex >= 0 && event.dayIndex <= 6) {
      return sum + getEventHours(event);
    }
    return sum;
  }, 0);

  return (
    <>
      {/* Header Panel */}
      <Header />

      {/* Main Content Grid */}
      <div className="flex-1 overflow-y-auto pr-1 pb-4 flex flex-col gap-6 text-left select-none w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
          {/* Left Column: Course Grids */}
          <div className="lg:col-span-8 flex flex-col gap-6 w-full">
            {/* Section 1: Created by Me */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-[17px] font-extrabold text-[#121212] tracking-tight">
                    Classes Created by Me
                  </h2>
                  <span className="bg-[#f25c88]/10 text-[#f25c88] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                    {createdSubjects.length}
                  </span>
                </div>
                <Link
                  href="/dashboard/subject/create"
                  className="flex items-center gap-1 px-4 py-2 bg-[#121212] text-white hover:bg-zinc-800 text-[11px] font-extrabold rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Class
                </Link>
              </div>

              {createdSubjects.length === 0 ? (
                <div className="w-full h-32 flex flex-col items-center justify-center border border-dashed border-[#E5E1D8] rounded-3xl p-6 bg-white/40">
                  <span className="text-[12px] text-zinc-400 font-semibold">You haven't created any subjects yet.</span>
                  <Link href="/dashboard/subject/create" className="text-[11px] text-[#f25c88] font-bold mt-1.5 hover:underline">
                    Create one now &rarr;
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-300">
                  {createdSubjects.map((subject) => (
                    <SubjectCard key={subject.id} subject={subject} />
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 mt-2">
              <div className="flex items-center gap-2">
                <h2 className="text-[17px] font-extrabold text-[#121212] tracking-tight">
                  Classes I&apos;ve Joined
                </h2>
                <span className="bg-[#f25c88]/10 text-[#f25c88] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                  {joinedSubjects.length}
                </span>
              </div>

              {joinedSubjects.length === 0 ? (
                <div className="w-full h-24 flex items-center justify-center border border-dashed border-[#E5E1D8] rounded-3xl p-6 bg-white/40">
                  <span className="text-[12px] text-zinc-400 font-semibold">You haven&apos;t joined any other classes yet.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-300">
                  {joinedSubjects.map((subject) => (
                    <SubjectCard key={subject.id} subject={subject} />
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#f25c88]" />
                  <h2 className="text-[17px] font-extrabold text-[#121212] tracking-tight">
                    Discover Open Classes
                  </h2>
                  <span className="bg-[#f25c88]/10 text-[#f25c88] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                    {filteredDiscoverable.length}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar max-w-full">
                  {discoverCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedDiscoverCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-[10.5px] font-bold border transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                        selectedDiscoverCategory === cat
                          ? "bg-[#121212] text-white border-[#121212]"
                          : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {filteredDiscoverable.length === 0 ? (
                <div className="w-full h-32 flex flex-col items-center justify-center border border-dashed border-[#E5E1D8] rounded-3xl p-6 bg-white/40">
                  <span className="text-[12px] text-zinc-400 font-semibold">No discoverable classes in this category.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-300">
                  {filteredDiscoverable.map((subject) => {
                    const color = subject.color && subject.color.startsWith("#")
                      ? subject.color
                      : subject.color === "yellow"
                      ? "#FAD56B"
                      : subject.color === "blue"
                      ? "#BFD3F7"
                      : "#f25c88";

                    return (
                      <div
                        key={subject.id}
                        className="bg-white border border-[#E5E1D8]/45 rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.005)] flex flex-col justify-between gap-4 hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <div className="flex flex-col gap-1.5 text-left">
                          <div className="flex items-center justify-between">
                            <span
                              className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider"
                              style={{
                                backgroundColor: `${color}10`,
                                borderColor: `${color}20`,
                                color: color,
                              }}
                            >
                              {subject.category || "Lecture"}
                            </span>
                            {subject.room && (
                              <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-0.5">
                                <MapPin className="w-3 h-3" />
                                {subject.room}
                              </span>
                            )}
                          </div>
                          <h4 className="text-[14px] font-extrabold text-zinc-800 leading-snug line-clamp-1">
                            {subject.name}
                          </h4>
                          <span className="text-[11px] text-zinc-500 font-medium truncate">
                            Lecturer: {subject.lecturers?.map((l) => l.name).join(", ") || "Unknown"}
                          </span>
                        </div>
                        <button
                          onClick={async () => {
                            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
                            const token = localStorage.getItem("token");
                            try {
                              const res = await fetch(`${API_BASE_URL}/subjects/${subject.id}/join`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  ...(token ? { "Authorization": `Bearer ${token}` } : {}),
                                },
                              });
                              if (!res.ok) throw new Error("Failed to join class");
                              showToast(`Successfully joined ${subject.name}!`, "success");
                              setTimeout(() => {
                                window.location.href = `/dashboard/subject/${subject.id}`;
                              }, 800);
                            } catch (err) {
                              showToast("Failed to join class", "error");
                            }
                          }}
                          className="w-full py-2 bg-[#121212] hover:bg-zinc-800 text-white font-extrabold text-[11px] rounded-2xl transition-all cursor-pointer text-center active:scale-95 flex items-center justify-center gap-1"
                        >
                          Join Class
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Weekly Study Activity Chart */}
          <div className="lg:col-span-4 w-full flex flex-col gap-4">
            <div className="flex items-center justify-between h-[38px] pb-1">
              <div className="flex items-center gap-2">
                <h2 className="text-[17px] font-extrabold text-[#121212] tracking-tight">
                  Weekly Activity
                </h2>
                <span className="bg-[#f25c88]/10 text-[#f25c88] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                  {totalHours.toFixed(1)}h
                </span>
              </div>
            </div>
            <StudyActivityChart events={events} />

            <div className="flex flex-col gap-4 mt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-[17px] font-extrabold text-[#121212] tracking-tight">
                    Today's Classes
                  </h2>
                  <span className="bg-zinc-800 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                    {todayClasses.length}
                  </span>
                </div>
              </div>

              {todayClasses.length === 0 ? (
                <div className="w-full h-32 flex flex-col items-center justify-center border border-dashed border-[#E5E1D8] rounded-3xl p-6 bg-white/40">
                  <span className="text-[12px] text-zinc-400 font-semibold">No classes scheduled for today.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {todayClasses.map((cl, idx) => {
                    const isActive = isClassActive(cl.startTime, cl.endTime);
                    const color = cl.subject.color && cl.subject.color.startsWith("#")
                      ? cl.subject.color
                      : cl.subject.color === "yellow"
                      ? "#FAD56B"
                      : cl.subject.color === "blue"
                      ? "#BFD3F7"
                      : "#121212";

                    return (
                      <div
                        key={idx}
                        className={`bg-white border rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                          isActive ? "border-zinc-400 shadow-sm" : "border-[#E5E1D8]/30"
                        }`}
                      >
                        <div
                          className="w-1 h-10 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <div className="flex-1 min-w-0 flex flex-col items-start">
                          <span className="text-[13px] font-bold text-zinc-950 truncate w-full">
                            {cl.subject.name}
                          </span>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {cl.startTime} - {cl.endTime}
                            </span>
                            {cl.room && (
                              <span className="text-[10px] text-zinc-500 font-semibold flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {cl.room}
                              </span>
                            )}
                          </div>
                        </div>

                        {isActive && (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f25c88]/10 text-[#f25c88] text-[9.5px] font-extrabold animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#f25c88]" />
                            Live
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Modal */}
      <EventModal />
    </>
  );
}
