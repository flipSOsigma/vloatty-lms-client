"use client";

import React, { useState, useEffect } from "react";
import Header from "../../components/views/Header";
import SubjectCard from "../../components/ui/SubjectCard";
import EventModal from "../../components/views/EventModal";
import { useLms } from "../../context/LmsContext";
import Link from "next/link";
import { Plus, Clock, MapPin, Compass, Grid2x2Plus, Grid2x2X, Calendar, Activity } from "lucide-react";

export default function DashboardPage() {
  const { subjects, searchQuery, currentUser, events, showToast } = useLms();
  const [selectedDiscoverCategory, setSelectedDiscoverCategory] = useState("All");
  const [createdCols, setCreatedCols] = useState(3);
  const [joinedCols, setJoinedCols] = useState(3);
  const discoverCategories = ["All", "Lecture", "Lab", "Seminar", "Clinical", "Workshop"];

  const [time, setTime] = useState("");
  const [dateString, setDateString] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
      setDateString(now.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const getGridColsClass = (colCount: number) => {
    switch (colCount) {
      case 2:
        return "grid grid-cols-1 sm:grid-cols-2 gap-4";
      case 3:
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";
      case 4:
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";
      case 5:
        return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4";
      default:
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";
    }
  };

  const today = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayName = dayNames[today.getDay()];

  const mySubjects = subjects.filter(
    (subj) =>
      subj.createdBy === currentUser?.id ||
      subj.lecturers?.some((l) => l.userId === currentUser?.id) ||
      subj.participants?.some((p) => p.userId === currentUser?.id)
  );

  const todayClasses = mySubjects
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
    (subject) =>
      subject.createdBy === currentUser?.id ||
      subject.lecturers?.some((l) => l.userId === currentUser?.id)
  );
  
  const joinedSubjects = filteredSubjects.filter(
    (subject) =>
      subject.createdBy !== currentUser?.id &&
      !subject.lecturers?.some((l) => l.userId === currentUser?.id) &&
      subject.participants?.some((p) => p.userId === currentUser?.id)
  );

  const discoverableSubjects = filteredSubjects.filter(
    (subject) =>
      subject.isOpen &&
      subject.createdBy !== currentUser?.id &&
      !subject.lecturers?.some((l) => l.userId === currentUser?.id) &&
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
      <Header />

      <div className="flex-1 overflow-y-auto pr-1 pb-4 flex flex-col gap-6 text-left select-none w-full">
        {/* Master Column Grid layout (Left area vs Sticky Right area) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
          
          {/* LEFT COLUMN: Main content workspace */}
          <div className="lg:col-span-8 flex flex-col gap-8 w-full">
            
            {/* Elegant Gradient Welcoming card */}
            <div className="bg-gradient-to-r from-[#121212] via-zinc-900 to-zinc-800 rounded-3xl p-6 text-white border border-zinc-850 shadow-[0_16px_40px_rgba(0,0,0,0.12)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="flex-1 text-left">
                <span className="text-[10px] font-extrabold text-[#d97706] uppercase tracking-wider">
                  Academic Portal
                </span>
                <h3 className="text-[24px] font-black text-white tracking-tight leading-none mt-1.5">
                  Welcome back, {currentUser?.name || "User"}
                </h3>
                <p className="text-[11.5px] text-zinc-400 font-medium leading-normal mt-2">
                  Plan your lectures, coordinate files, and organize schedules dynamically from a single workspace.
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto">
                <div className="flex-1 sm:flex-initial bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center min-w-24">
                  <span className="text-[20px] font-black text-[#d97706] leading-none">
                    {joinedSubjects.length}
                  </span>
                  <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider mt-1.5">
                    Joined
                  </span>
                </div>
                <div className="flex-1 sm:flex-initial bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center min-w-24">
                  <span className="text-[20px] font-black text-white leading-none">
                    {createdSubjects.length}
                  </span>
                  <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider mt-1.5">
                    Created
                  </span>
                </div>
              </div>
            </div>

            {/* Classes I've Joined Grid */}
            <div className="flex flex-col gap-3 w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-[16px] font-extrabold text-[#121212] tracking-tight">
                    Classes I&apos;ve Joined
                  </h2>
                  <span className="bg-[#facc15]/10 text-[#d97706] text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full">
                    {joinedSubjects.length}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-white border border-[#E5E1D8]/45 p-1 rounded-xl shadow-sm shrink-0">
                  <button
                    onClick={() => setJoinedCols((prev) => Math.max(2, prev - 1))}
                    disabled={joinedCols <= 2}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-90 cursor-pointer"
                  >
                    <Grid2x2X className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-bold text-zinc-500 px-1 select-none">
                    {joinedCols}
                  </span>
                  <button
                    onClick={() => setJoinedCols((prev) => Math.min(5, prev + 1))}
                    disabled={joinedCols >= 5}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-90 cursor-pointer"
                  >
                    <Grid2x2Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {joinedSubjects.length === 0 ? (
                <div className="w-full py-10 flex flex-col items-center justify-center border border-dashed border-[#E5E1D8] rounded-3xl bg-white/40">
                  <span className="text-[12px] text-zinc-400 font-semibold">You haven&apos;t joined any other classes yet.</span>
                </div>
              ) : (
                <div className={getGridColsClass(joinedCols)}>
                  {joinedSubjects.map((subject, index) => (
                    <div
                      key={subject.id}
                      className="animate-fade-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <SubjectCard subject={subject} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Classes Created or Taught by me Grid */}
            <div className="flex flex-col gap-4 w-full">
              <div className="flex items-stretch justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-[16px] font-extrabold text-[#121212] tracking-tight">
                    Classes Created or Taught by Me
                  </h2>
                  <span className="bg-[#facc15]/10 text-[#d97706] text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full">
                    {createdSubjects.length}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href="/dashboard/subject/create"
                    className="flex items-center gap-1 px-4 py-2 bg-[#121212] text-white hover:bg-zinc-800 text-[11px] font-extrabold rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create Class
                  </Link>
                  <div className="flex items-center gap-1 bg-white border border-[#E5E1D8]/45 p-1 rounded-xl shadow-sm shrink-0">
                    <button
                      onClick={() => setCreatedCols((prev) => Math.max(2, prev - 1))}
                      disabled={createdCols <= 2}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-90 cursor-pointer"
                    >
                      <Grid2x2X className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-bold text-zinc-500 px-1 select-none">
                      {createdCols}
                    </span>
                    <button
                      onClick={() => setCreatedCols((prev) => Math.min(5, prev + 1))}
                      disabled={createdCols >= 5}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-90 cursor-pointer"
                    >
                      <Grid2x2Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {createdSubjects.length === 0 ? (
                <div className="w-full py-10 flex flex-col items-center justify-center border border-dashed border-[#E5E1D8] rounded-3xl bg-white/40">
                  <span className="text-[12px] text-zinc-400 font-semibold">You haven't created any subjects yet.</span>
                  <Link href="/dashboard/subject/create" className="text-[11px] text-[#d97706] font-bold mt-1.5 hover:underline">
                    Create one now &rarr;
                  </Link>
                </div>
              ) : (
                <div className={getGridColsClass(createdCols)}>
                  {createdSubjects.map((subject, index) => (
                    <div
                      key={subject.id}
                      className="animate-fade-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <SubjectCard subject={subject} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Discover Open Classes Grid */}
            <div className="flex flex-col gap-4 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#E5E1D8]/20 pt-6">
                <div className="flex items-center gap-2">
                  <Compass className="w-4.5 h-4.5 text-[#d97706]" />
                  <h2 className="text-[16px] font-extrabold text-[#121212] tracking-tight">
                    Discover Open Classes
                  </h2>
                  <span className="bg-[#facc15]/10 text-[#d97706] text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full">
                    {filteredDiscoverable.length}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar max-w-full">
                  {discoverCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedDiscoverCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
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
                <div className="w-full py-10 flex flex-col items-center justify-center border border-dashed border-[#E5E1D8] rounded-3xl bg-white/40">
                  <span className="text-[12px] text-zinc-400 font-semibold">No discoverable classes in this category.</span>
                </div>
              ) : (
                <div className={getGridColsClass(3)}>
                  {filteredDiscoverable.map((subject, index) => {
                    const color = "#facc15";

                    return (
                      <div
                        key={subject.id}
                        className="animate-fade-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div
                          className="bg-white border border-[#E5E1D8]/45 rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.005)] flex flex-col justify-between gap-4 hover:-translate-y-0.5 transition-all duration-250 h-full"
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
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Live Clock, Today's Schedule and Analytics */}
          <div className="lg:col-span-4 flex flex-col gap-6 w-full lg:sticky lg:top-0">
            
            {/* Live Clock & Calendar Card */}
            <div className="bg-white border border-[#E5E1D8]/60 rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex flex-col gap-4 text-left">
              <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100/60">
                <span className="text-[9.5px] font-extrabold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#d97706]" />
                  Live Portal Clock
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <div className="flex flex-col items-start">
                <h2 className="text-[34px] font-black text-zinc-900 tracking-tight leading-none tabular-nums">
                  {time || "00:00:00"}
                </h2>
                <p className="text-[10px] text-[#d97706] font-black mt-2.5 uppercase tracking-wider">
                  {dateString || "Loading date..."}
                </p>
              </div>
            </div>

            {/* Today's Schedule Timeline */}
            <div className="bg-white border border-[#E5E1D8]/60 rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex flex-col gap-4 flex-1">
              <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100/60">
                <h3 className="text-[13.5px] font-extrabold text-zinc-850 tracking-tight">
                  Today's Classes
                </h3>
                <span className="bg-zinc-900 text-white text-[9.5px] font-extrabold px-2 py-0.5 rounded-full">
                  {todayClasses.length}
                </span>
              </div>

              {todayClasses.length === 0 ? (
                <div className="flex-grow py-10 flex flex-col items-center justify-center border border-dashed border-[#E5E1D8] rounded-2xl bg-[#FAF9F5]/40 text-center">
                  <span className="text-[20px] mb-1">📅</span>
                  <span className="text-[11px] text-zinc-400 font-semibold">No schedules for today.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[300px] pr-1">
                  {todayClasses.map((cl, idx) => {
                    const isActive = isClassActive(cl.startTime, cl.endTime);
                    const color = "#facc15";

                    return (
                      <div
                        key={idx}
                        className={`border rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5 ${
                          isActive 
                            ? "border-[#f97316] bg-[#facc15]/5 shadow-sm" 
                            : "border-zinc-100 bg-white"
                        }`}
                      >
                        <div
                          className="w-1.5 h-10 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <div className="flex-1 min-w-0 flex flex-col items-start">
                          <span className="text-[13px] font-extrabold text-zinc-950 truncate w-full">
                            {cl.subject.name}
                          </span>
                          <div className="flex items-center gap-2.5 mt-1">
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
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#facc15]/10 text-[#d97706] text-[9.5px] font-extrabold animate-pulse">
                            Live
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Study Intensity Progress Tracker */}
            <div className="bg-white border border-[#E5E1D8]/60 rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex flex-col gap-3 text-left">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Activity className="w-4 h-4 text-[#d97706]" />
                <h3 className="text-[9.5px] font-extrabold uppercase tracking-wider">
                  Weekly Study Load
                </h3>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-zinc-900 tracking-tight leading-none">
                  {totalHours.toFixed(1)}h
                </span>
                <span className="text-[11px] text-zinc-400 font-semibold">scheduled lectures</span>
              </div>
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden mt-1.5">
                <div 
                  className="bg-[#facc15] h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (totalHours / 40) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-zinc-400 font-bold uppercase mt-1">
                <span>Target: 40 hours</span>
                <span>{Math.round(Math.min(100, (totalHours / 40) * 100))}% Completed</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <EventModal />
    </>
  );
}
