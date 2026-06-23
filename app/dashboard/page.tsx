"use client";

import React, { useState, useEffect } from "react";
import Header from "../../components/views/Header";
import EventModal from "../../components/views/EventModal";
import { useLms } from "../../context/LmsContext";
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  FileText,
  SlidersHorizontal,
  ChevronDown,
  Download,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Subject, LmsEvent } from "../../types/lms";
import { animate, stagger } from "animejs";

export default function DashboardPage() {
  const { subjects, searchQuery, currentUser, events, setSelectedEvent } = useLms();

  const [time, setTime] = useState("");
  const [stats, setStats] = useState<{
    storage: {
      usedBytes: number;
      maxBytes: number;
      materialsBytes: number;
      submissionsBytes: number;
      systemAssetsBytes: number;
    };
    weeklyActivity: {
      total: number;
      subjects: number;
      modules: number;
      lessons: number;
    };
  } | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  useEffect(() => {
    if (!currentUser?.id) return;
    const fetchStats = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/users/${currentUser.id}/dashboard-stats`, {
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to fetch dashboard stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
        setStats({
          storage: {
            usedBytes: 85971200,
            maxBytes: 200 * 1024 * 1024,
            materialsBytes: 52120000,
            submissionsBytes: 21512000,
            systemAssetsBytes: 12339200,
          },
          weeklyActivity: {
            total: 12,
            subjects: 2,
            modules: 4,
            lessons: 6,
          },
        });
      }
    };
    fetchStats();
  }, [currentUser]);

  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(new Date());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const calendarColHeaders = ["M", "T", "W", "T", "F", "S", "S"];

  const getCalendarDays = () => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;

    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const cells: { dayNum: number; isCurrentMonth: boolean; date: Date }[] = [];

    for (let i = offset - 1; i >= 0; i--) {
      const d = prevMonthTotalDays - i;
      cells.push({
        dayNum: d,
        isCurrentMonth: false,
        date: new Date(year, month - 1, d)
      });
    }

    for (let d = 1; d <= totalDays; d++) {
      cells.push({
        dayNum: d,
        isCurrentMonth: true,
        date: new Date(year, month, d)
      });
    }

    const totalCellsNeeded = cells.length > 35 ? 42 : 35;
    const nextMonthDays = totalCellsNeeded - cells.length;
    for (let d = 1; d <= nextMonthDays; d++) {
      cells.push({
        dayNum: d,
        isCurrentMonth: false,
        date: new Date(year, month + 1, d)
      });
    }

    return cells;
  };

  const prevMonth = () => {
    const newDate = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1);
    setCurrentCalendarDate(newDate);
    const lastDayOfNewMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
    const targetDay = Math.min(selectedCalendarDay.getDate(), lastDayOfNewMonth);
    setSelectedCalendarDay(new Date(newDate.getFullYear(), newDate.getMonth(), targetDay));
  };

  const nextMonth = () => {
    const newDate = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1);
    setCurrentCalendarDate(newDate);
    const lastDayOfNewMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
    const targetDay = Math.min(selectedCalendarDay.getDate(), lastDayOfNewMonth);
    setSelectedCalendarDay(new Date(newDate.getFullYear(), newDate.getMonth(), targetDay));
  };

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    animate(".anime-card", {
      translateY: [24, 0],
      opacity: [0, 1],
      delay: stagger(80),
      duration: 800,
      easing: "easeOutQuad"
    });
  }, []);

  const today = new Date();
  const todayDayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1;

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

  const SubjectThumbnail = ({ subject }: { subject: Subject }) => {
    const [imgError, setImgError] = useState(false);

    if (subject.thumbnail && !imgError) {
      return (
        <img
          src={subject.thumbnail}
          alt={subject.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-[#facc15]/10 text-[#d97706] font-bold text-[13px] border border-[#facc15]/20 shadow-xs">
        {subject.name.slice(0, 2).toUpperCase()}
      </div>
    );
  };

  const todayTimelineEvents = React.useMemo(() => {
    const mapped = events.map((event) => {
      if (event.dateStr) {
        const d = new Date(event.dateStr);
        if (!isNaN(d.getTime())) {
          const day = d.getDay();
          const dayIdx = day === 0 ? 6 : day - 1;
          return { ...event, dayIndex: dayIdx };
        }
      }
      return event;
    });

    const todayEvts = mapped.filter((event) => !event.deletedAt && event.dayIndex === todayDayIdx);

    if (todayEvts.length === 0 && subjects.length > 0) {
      const mockSlots = [
        { startTime: "09:30", endTime: "11:30", title: "Calculus Seminar" },
        { startTime: "12:00", endTime: "14:15", title: "Classical Mechanics" },
        { startTime: "15:00", endTime: "17:00", title: "Web Engineering" },
      ];
      return mockSlots.map((slot, idx) => {
        const subj = subjects[idx % subjects.length];
        return {
          id: `mock-today-${idx}`,
          title: slot.title,
          subtitle: subj.room || "Room 302",
          timeStart: slot.startTime,
          timeEnd: slot.endTime,
          dayIndex: todayDayIdx,
          color: idx === 0 ? "yellow" : idx === 1 ? "blue" : "pink",
          subjectId: subj.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null
        } as LmsEvent;
      });
    }
    return todayEvts;
  }, [events, todayDayIdx, subjects]);

  const HOURS = [
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00"
  ];
  const START_HOUR = 7;
  const HOUR_WIDTH = 145;
  const MINUTE_WIDTH = HOUR_WIDTH / 60;
  const TRACK_HEIGHT = 70;

  const getMinutesFromStart = (timeStr: string): number => {
    const [h, m] = timeStr.split(":").map(Number);
    const totalMins = h * 60 + m;
    const startMins = START_HOUR * 60;
    return totalMins - startMins;
  };

  const { timelineGridEvents, totalTracks } = React.useMemo(() => {
    const sorted = [...todayTimelineEvents].sort((a, b) => {
      const aMin = getMinutesFromStart(a.timeStart);
      const bMin = getMinutesFromStart(b.timeStart);
      return aMin - bMin;
    });

    const tracks: { endMin: number }[] = [];
    const eventWithTracks = sorted.map((event) => {
      const startMin = getMinutesFromStart(event.timeStart);
      const endMin = getMinutesFromStart(event.timeEnd);

      let assignedTrack = -1;
      for (let i = 0; i < tracks.length; i++) {
        if (tracks[i].endMin + 5 <= startMin) {
          assignedTrack = i;
          tracks[i].endMin = endMin;
          break;
        }
      }

      if (assignedTrack === -1) {
        assignedTrack = tracks.length;
        tracks.push({ endMin });
      }

      return {
        ...event,
        trackIndex: assignedTrack,
      };
    });

    return {
      timelineGridEvents: eventWithTracks,
      totalTracks: Math.max(1, tracks.length),
    };
  }, [todayTimelineEvents]);

  const curMins = getMinutesFromStart(time || "08:00");
  const timeLineLeft = curMins * MINUTE_WIDTH;

  // Bubble chart details
  const bubbleData = {
    Lectures: [2, 1, 3, 0, 2, 3, 1],
    Tasks:    [1, 3, 0, 2, 1, 0, 3],
  };
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const categories = ["Lectures", "Tasks"];

  // Bar chart details
  const bars = [
    { label: "Lectures", value: "7.7 hrs", height: "55%" },
    { label: "Tasks", value: "5.6 tasks", height: "40%" },
    { label: "Modules", value: "12 mods", height: "85%", active: true },
    { label: "Lessons", value: "8.1 less", height: "65%" },
  ];

  // Storage data
  const usedPct = stats ? Math.round((stats.storage.usedBytes / stats.storage.maxBytes) * 100) : 41;
  const usedBytesStr = stats ? formatFileSize(stats.storage.usedBytes) : "82 MB";
  const maxBytesStr = stats ? formatFileSize(stats.storage.maxBytes) : "200 MB";

  return (
    <>
      <Header />

      <div className="flex-grow overflow-y-auto pr-1 pb-6 flex flex-col gap-6 text-left select-none w-full no-scrollbar bg-[#FAF7F2]">
        <div className="w-full px-2 md:px-4 flex flex-col gap-4">
          
          {/* Dashboard Page Header & Description */}
          <div className="flex flex-col md:flex-row md:items-center justify-between w-full mt-2 mb-2 gap-4">
            <div className="flex flex-col text-left">
              <h1 className="text-3xl font-extrabold text-zinc-950 tracking-tight leading-normal">
                Academic Overview
              </h1>
              <p className="text-[12.5px] text-zinc-500 font-semibold max-w-2xl mt-1 leading-snug">
                Monitor your study metrics, check weekly learning activities, review scheduled calendar events, and manage course storage limits.
              </p>
            </div>
            
            {/* Action Pills */}
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-4 py-2 border border-zinc-200 bg-white hover:bg-zinc-50 rounded-full text-[12px] font-extrabold text-zinc-700 cursor-pointer shadow-sm">
                <span>Default View</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 border border-zinc-200 bg-white hover:bg-zinc-50 rounded-full text-[12px] font-extrabold text-zinc-700 cursor-pointer shadow-sm">
                <Download className="w-3.5 h-3.5 text-zinc-400" />
                <span>Export</span>
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 border border-zinc-200 bg-white hover:bg-zinc-50 rounded-full text-[12px] font-extrabold text-zinc-700 cursor-pointer shadow-sm">
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Grid Layout containing ALL components, arranged beautifully with 3 to 4 components per row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full mt-2">
            
            {/* ROW 1: 3 Components (Bubble chart: 6, Join Mastery: 3, Storage Gauge: 3) */}
            
            {/* 1. Study Activity Breakdown (Bubble chart) */}
            <div className="anime-card opacity-0 lg:col-span-6 bg-white border border-[#EFECE6] rounded-[32px] p-6 shadow-xs flex flex-col justify-between text-left h-[300px] relative overflow-hidden group">
              {/* Subtle Dot Grid Background */}
              <div className="absolute inset-0 pointer-events-none opacity-50 z-0" style={{
                backgroundImage: "radial-gradient(circle, #EFECE6 1.5px, transparent 1.5px)",
                backgroundSize: "16px 16px"
              }} />
              
              <div className="absolute right-0 top-0 w-24 h-24 bg-[#facc15]/5 rounded-full filter blur-[20px] pointer-events-none z-0" />
              
              <div className="flex justify-between items-start relative z-10">
                <div className="flex flex-col">
                  <span className="text-[11px] font-extrabold text-zinc-400 leading-normal tracking-wide">Breakdown</span>
                  <h3 className="text-xl font-bold tracking-tight text-zinc-900 mt-1 leading-normal">Study Activity Breakdown</h3>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1 px-3 py-1.5 border border-zinc-200 bg-white hover:bg-zinc-50 rounded-full text-[11px] font-bold text-zinc-650 cursor-pointer">
                    <span>Weekly</span>
                    <ChevronDown className="w-3 h-3 text-zinc-400" />
                  </button>
                  <button className="w-7 h-7 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-800 cursor-pointer">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Bubbles Grid */}
              <div className="flex flex-col gap-2 mt-3 relative z-10">
                <div className="w-full"></div>
                {categories.map((cat) => (
                  <div key={cat} className="flex w-full items-center justify-between">
                    <span className="text-[12px] font-extrabold text-zinc-400 w-16 text-left">{cat}</span>
                    <div className="flex-1 flex justify-end gap-4 items-center pl-4">
                      {bubbleData[cat as keyof typeof bubbleData].map((val, idx) => {
                        let sizeClass = "w-5 h-5";
                        let colorClass = "bg-zinc-100";
                        if (val === 3) {
                          sizeClass = "w-8 h-8";
                          colorClass = "bg-[#facc15]";
                        } else if (val === 2) {
                          sizeClass = "w-6.5 h-6.5";
                          colorClass = "bg-zinc-900";
                        } else if (val === 1) {
                          sizeClass = "w-5 h-5";
                          colorClass = "bg-zinc-300";
                        } else {
                          sizeClass = "w-3.5 h-3.5 opacity-60";
                          colorClass = "bg-zinc-200";
                        }
                        return (
                          <div key={idx} className="w-10 h-10 flex items-center justify-center">
                            <div className={`${sizeClass} ${colorClass} rounded-full transition-all duration-300 hover:scale-125 cursor-pointer`} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                {/* Days labels */}
                <div className="flex items-center justify-between pt-2 mt-1">
                  <span className="w-16" />
                  <div className="flex-1 flex justify-end gap-6 pl-4 pr-1">
                    {days.map((day, idx) => (
                      <span key={idx} className="w-8 text-center text-[10.5px] font-black text-zinc-400">
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Join Mastery Program (Featured black card) */}
            <div className="anime-card opacity-0 lg:col-span-3 bg-[#121212] rounded-[32px] p-6 text-white overflow-hidden flex flex-col justify-between h-[300px] border border-[#EFECE6]/10 shadow-xs relative">
              <div className="absolute right-[-20px] bottom-[-20px] w-48 h-48 bg-[#facc15]/10 rounded-full filter blur-[40px] pointer-events-none" />
              <div className="absolute left-[-20px] top-[-20px] w-32 h-32 bg-[#d97706]/10 rounded-full filter blur-[30px] pointer-events-none" />

              <div className="flex flex-col gap-1 items-start text-left z-10">
                <span className="text-[9.5px] font-extrabold tracking-wide bg-white/10 text-[#facc15] px-2.5 py-0.5 rounded-full leading-normal">
                  Featured
                </span>
                <h3 className="text-lg font-bold tracking-tight mt-2.5 leading-normal">
                  Academic Mastery
                </h3>
                <p className="text-[10px] text-zinc-450 font-medium leading-snug mt-1.5">
                  Boost class collaboration with peer discussion modules.
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-2 z-10 w-full">
                <span className="text-[10px] font-bold text-[#facc15] bg-[#facc15]/10 px-2 py-0.5 rounded-full self-start">
                  +15% members
                </span>
                <a
                  href="/dashboard/subjects"
                  className="bg-[#facc15] hover:bg-yellow-400 text-zinc-950 font-extrabold text-[11px] py-2 px-4 rounded-full flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-[#facc15]/20"
                >
                  <span>Join Class</span>
                  <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                </a>
              </div>
            </div>

            {/* 3. Storage Quota circular gauge */}
            <div className="anime-card opacity-0 lg:col-span-3 bg-white border border-[#EFECE6] rounded-[32px] p-6 shadow-xs flex flex-col justify-between text-left h-[300px]">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] font-extrabold text-zinc-400 leading-normal tracking-wide">Storage</span>
                  <h3 className="text-lg font-bold tracking-tight text-zinc-900 mt-0.5 leading-normal">Quota Limit</h3>
                </div>
                <button className="w-7 h-7 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-855 cursor-pointer">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Arc Gauge in SVG */}
              <div className="flex flex-col items-center justify-center my-0.5 relative">
                <svg className="w-28 h-20" viewBox="0 0 100 60">
                  {/* Background path */}
                  <path
                    d="M 15 50 A 35 35 0 0 1 85 50"
                    fill="none"
                    stroke="#f4f4f5"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* Active gauge path */}
                  <path
                    d="M 15 50 A 35 35 0 0 1 85 50"
                    fill="none"
                    stroke="#facc15"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="110"
                    strokeDashoffset={110 - (110 * usedPct) / 100}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                
                <div className="absolute bottom-2 flex flex-col items-center">
                  <span className="text-[20px] font-black text-zinc-955 leading-none">{usedPct}%</span>
                  <span className="text-[8px] text-zinc-400 font-extrabold uppercase mt-0.5">used</span>
                </div>
              </div>

              {/* Legends */}
              <div className="flex justify-between items-center border-t border-zinc-100 pt-2 text-[9px] font-bold text-zinc-500">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-zinc-900" />
                  <span>{usedBytesStr}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#facc15]/30" />
                  <span>{maxBytesStr}</span>
                </div>
              </div>
            </div>

            {/* ROW 2: 3 Components (Bar chart: 6, Next Session: 3, Academic Report: 3) */}

            {/* 4. Subject Completion Stats (Bar chart) */}
            <div className="anime-card opacity-0 lg:col-span-6 bg-white border border-[#EFECE6] rounded-[32px] p-6 shadow-xs flex flex-col justify-between text-left h-[300px]">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[11px] font-extrabold text-zinc-400 leading-normal tracking-wide">Activity Stats</span>
                  <h3 className="text-xl font-bold tracking-tight text-zinc-900 mt-1 leading-normal">Study Progress Overview</h3>
                </div>
                <div className="flex gap-1.5">
                  <button className="px-3 py-1.5 border border-zinc-200 bg-white hover:bg-zinc-50 rounded-full text-[10px] font-extrabold text-zinc-650 cursor-pointer">
                    Sort Week
                  </button>
                  <button className="px-3 py-1.5 border border-zinc-200 bg-white hover:bg-zinc-50 rounded-full text-[10px] font-extrabold text-zinc-655 cursor-pointer">
                    All
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between flex-1 mt-4 h-full gap-2">
                {/* Percentage details */}
                <div className="flex flex-col justify-end pb-2 text-left w-32 shrink-0">
                  <span className="text-[30px] font-black text-zinc-950 leading-none tracking-tight">+73.6%</span>
                  <span className="text-[9.5px] text-zinc-400 font-bold mt-2 leading-snug">
                    average score rate increase
                  </span>
                </div>

                {/* Bars chart */}
                <div className="flex-grow flex items-end justify-around h-full pl-0 sm:pl-4 max-w-[360px]">
                  {bars.map((bar, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end w-10 group">
                      {/* Vertical Bar */}
                      <div className="w-6 bg-zinc-100 rounded-xl relative flex flex-col justify-end transition-all duration-300 hover:scale-105 h-[110px]">
                        <div
                          className="w-full rounded-xl flex flex-col justify-end items-center relative"
                          style={{
                            height: bar.height,
                            backgroundColor: bar.active ? '#facc15' : '#121212'
                          }}
                        >
                          <div className="absolute top-[-25px] bg-[#121212] text-white text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-md shadow-sm border border-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {bar.value}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-zinc-400">{bar.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. Next Scheduled Session */}
            <div className="anime-card opacity-0 lg:col-span-3 bg-white border border-[#EFECE6] rounded-[32px] p-6 shadow-xs flex flex-col justify-between text-left h-[300px]">
              <div className="flex justify-between items-center w-full">
                <span className="text-[10px] font-extrabold text-zinc-400 leading-normal tracking-wide">Next Session</span>
                <span className="w-7 h-7 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-555 cursor-pointer">
                  <Calendar className="w-4 h-4" />
                </span>
              </div>

              <div className="flex flex-col gap-1.5 mt-2 flex-grow justify-center">
                <span className="text-[10px] font-bold text-[#d97706] bg-[#facc15]/15 px-2 py-0.5 rounded-md self-start">
                  Today
                </span>
                <h3 className="text-[18px] font-black text-zinc-955 tracking-tight mt-1 truncate">
                  {todayTimelineEvents[0]?.title || "Calculus Seminar"}
                </h3>
                <span className="text-[11.5px] font-bold text-zinc-600">
                  {todayTimelineEvents[0]?.timeStart ? `${todayTimelineEvents[0].timeStart} - ${todayTimelineEvents[0].timeEnd}` : "09:30 - 11:30"}
                </span>
                <span className="text-[11px] font-semibold text-zinc-400">
                  {todayTimelineEvents[0]?.subtitle || "Room 302"}
                </span>
              </div>

              <div className="flex items-center gap-1 border-t border-zinc-100 pt-3 mt-1 text-[10px] font-bold text-zinc-500">
                <span className="text-zinc-955 font-black">12% done</span>
                <span className="text-zinc-400">&bull; Live sync</span>
              </div>
            </div>

            {/* 6. Academic Transcript report */}
            <div className="anime-card opacity-0 lg:col-span-3 bg-[#121212] text-white rounded-[32px] p-6 shadow-xs flex flex-col justify-between text-left h-[300px] relative overflow-hidden">
              <div className="flex justify-between items-center w-full">
                <button className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/80 cursor-pointer">
                  <span className="text-[10px] font-bold">✕</span>
                </button>
                <div className="flex gap-1.5">
                  <button className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/80 cursor-pointer">
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                  <button className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/80 cursor-pointer">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1 items-start mt-4">
                <span className="text-[9.5px] font-extrabold text-[#facc15] bg-[#facc15]/10 border border-[#facc15]/20 px-2 py-0.5 rounded-full leading-normal tracking-wide">
                  Print Report
                </span>
                <h3 className="text-[18px] font-bold tracking-tight text-white mt-2 leading-normal">
                  Academic Report
                </h3>
              </div>

              <div className="text-[9.5px] text-zinc-500 font-semibold border-t border-white/5 pt-3">
                Grades generator & printer
              </div>
            </div>

            {/* ROW 3: 3 Components (Active Classes: 4, My Classes: 4, Calendar: 4) */}

            {/* 7. Active Classes (Student joined courses) */}
            <div className="anime-card opacity-0 lg:col-span-3 bg-white border border-[#EFECE6] rounded-3xl p-5 shadow-xs h-[270px] flex flex-col gap-3 text-left">
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-extrabold text-zinc-900">Active Classes</span>
                <span className="text-[10px] text-zinc-400 font-bold bg-zinc-100 px-2 py-0.5 rounded-full">{joinedSubjects.length} Courses</span>
              </div>
              <div className="flex flex-col gap-2 overflow-y-auto pr-1 no-scrollbar flex-grow">
                {joinedSubjects.map((subject) => (
                  <a key={subject.id} href={`/dashboard/subject/${subject.id}`} className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-zinc-50/60 border border-zinc-100/50 hover:bg-zinc-50 transition-all cursor-pointer group">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0 relative"><SubjectThumbnail subject={subject} /></div>
                      <div className="flex flex-col min-w-0 text-left">
                        <h4 className="text-[11px] font-extrabold text-zinc-800 truncate leading-snug">{subject.name}</h4>
                        <span className="text-[9px] text-zinc-400 font-semibold truncate">{subject.lecturers?.map((l) => l.name.split(" ")[0]).join(", ") || "Unknown"}</span>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#facc15]/15 group-hover:bg-[#facc15] flex items-center justify-center text-zinc-850 transition-colors flex-shrink-0"><ArrowRight className="w-3.5 h-3" /></div>
                  </a>
                ))}
                {joinedSubjects.length === 0 && (
                  <div className="py-6 text-center text-zinc-400 text-[10.5px] font-bold border border-dashed border-[#E5E1D8]/80 rounded-2xl bg-white/40 my-auto">No subjects joined</div>
                )}
              </div>
            </div>

            {/* 8. My Classes (Lecturer created courses) */}
            <div className="anime-card opacity-0 lg:col-span-3 bg-white border border-[#EFECE6] rounded-3xl p-5 shadow-xs h-[270px] flex flex-col gap-3 text-left">
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-extrabold text-zinc-900">My Classes</span>
                <span className="text-[10px] text-zinc-400 font-bold bg-zinc-100 px-2 py-0.5 rounded-full">{createdSubjects.length} Courses</span>
              </div>
              <div className="flex flex-col gap-2 overflow-y-auto pr-1 no-scrollbar flex-grow">
                {createdSubjects.map((subject) => (
                  <a key={subject.id} href={`/dashboard/subject/${subject.id}`} className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-zinc-50/60 border border-zinc-100/50 hover:bg-zinc-50 transition-all cursor-pointer group">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0 relative"><SubjectThumbnail subject={subject} /></div>
                      <div className="flex flex-col min-w-0 text-left">
                        <h4 className="text-[11px] font-extrabold text-zinc-800 truncate leading-snug">{subject.name}</h4>
                        <span className="text-[9px] text-zinc-400 font-semibold truncate">{subject.lecturers?.map((l) => l.name.split(" ")[0]).join(", ") || "Unknown"}</span>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#facc15]/15 group-hover:bg-[#facc15] flex items-center justify-center text-zinc-855 transition-colors flex-shrink-0"><ArrowRight className="w-3.5 h-3" /></div>
                  </a>
                ))}
                {createdSubjects.length === 0 && (
                  <div className="py-6 text-center text-zinc-400 text-[10.5px] font-bold border border-dashed border-[#E5E1D8]/80 rounded-2xl bg-white/40 my-auto">No subjects created</div>
                )}
              </div>
            </div>

            {/* 9. Interactive Calendar */}
            <div className="anime-card opacity-0 lg:col-span-3 bg-white border border-[#EFECE6] rounded-3xl p-5 shadow-xs h-[270px] flex flex-col justify-between text-left">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-extrabold text-zinc-400 leading-normal tracking-wide">Calendar</span>
                <div className="flex items-center gap-2">
                  <button onClick={prevMonth} className="text-zinc-400 hover:text-zinc-650 transition-all cursor-pointer active:scale-95 p-1 rounded-lg hover:bg-zinc-50 border border-zinc-200/50" title="Previous Month">
                    <ChevronLeft className="w-3.5 h-3.5 stroke-[2]" />
                  </button>
                  <button onClick={nextMonth} className="text-zinc-400 hover:text-zinc-650 transition-all cursor-pointer active:scale-95 p-1 rounded-lg hover:bg-zinc-50 border border-zinc-200/50" title="Next Month">
                    <ChevronRight className="w-3.5 h-3.5 stroke-[2]" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-0.5 mt-1 select-none">
                <span className="text-2xl font-semibold text-zinc-855 tracking-tight leading-normal">
                  {monthNames[currentCalendarDate.getMonth()].slice(0, 3)} {currentCalendarDate.getFullYear()}
                </span>
                <span className="text-[9.5px] text-zinc-400 font-semibold mt-1">
                  Selected: {selectedCalendarDay.getDate()} {monthNames[selectedCalendarDay.getMonth()].slice(0, 3)}
                </span>
              </div>

              <div className="flex flex-col gap-2 w-full mt-3">
                <div className="grid grid-cols-7 text-center select-none">
                  {calendarColHeaders.map((h, i) => (
                    <span key={i} className="text-[8.5px] font-bold text-zinc-400/60 uppercase">
                      {h}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-y-2 justify-items-center">
                  {getCalendarDays().map((cell, idx) => {
                    const isSelected = selectedCalendarDay.getDate() === cell.dayNum &&
                      selectedCalendarDay.getMonth() === cell.date.getMonth() &&
                      selectedCalendarDay.getFullYear() === cell.date.getFullYear();
                    const isToday = cell.date.toDateString() === today.toDateString();
                    let dotStyle = "w-[12px] h-[12px] rounded-full transition-all duration-200 cursor-pointer active:scale-95 select-none";
                    if (!cell.isCurrentMonth) {
                      dotStyle += " opacity-20";
                    }
                    if (isSelected) {
                      dotStyle += " bg-[#facc15] shadow-[0_2px_8px_rgba(250,204,21,0.5)] scale-110";
                    } else if (isToday && cell.isCurrentMonth) {
                      dotStyle += " border-2 border-zinc-800 bg-transparent";
                    } else if (cell.isCurrentMonth) {
                      dotStyle += " bg-zinc-200 hover:bg-zinc-300";
                    } else {
                      dotStyle += " bg-zinc-100 hover:bg-zinc-200";
                    }
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedCalendarDay(cell.date);
                          if (!cell.isCurrentMonth) {
                            setCurrentCalendarDate(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1));
                          }
                        }}
                        className={dotStyle}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ROW 4: 1 Wide Component (Horizontal Timeline scheduler tracks) */}
            
            {/* 10. Horizontal Timeline Track Grid */}
            <div className="anime-card opacity-0 lg:col-span-12 row-span-1 bg-white border border-[#EFECE6] rounded-3xl p-5 shadow-xs h-[270px] flex flex-col text-left overflow-hidden">
              <div className="flex justify-between items-center w-full mb-3 shrink-0">
                <span className="text-[13px] font-extrabold text-zinc-900 leading-normal tracking-wide">Lecture timetable schedule</span>
                <span className="text-[10px] text-zinc-400 font-semibold bg-zinc-100 px-2.5 py-0.5 rounded-full">Today&apos;s Grid</span>
              </div>
              <div className="relative flex flex-col flex-1 overflow-hidden">
                <div className="flex-1 overflow-x-auto overflow-y-hidden no-scrollbar">
                  <div className="relative" style={{ width: `${HOURS.length * HOUR_WIDTH}px`, height: "100%", minHeight: `${totalTracks * TRACK_HEIGHT + 20}px` }}>
                    <div className="flex sticky top-0 z-10 shrink-0">
                      {HOURS.map((hour) => (
                        <div key={hour} className="text-left text-[9px] text-zinc-300 font-bold pb-1.5 select-none shrink-0" style={{ width: `${HOUR_WIDTH}px` }}>{hour}</div>
                      ))}
                    </div>
                    <div className="absolute inset-0" style={{ top: "24px" }}>
                      {timeLineLeft >= 0 && timeLineLeft <= HOURS.length * HOUR_WIDTH && (
                        <div className="absolute top-0 bottom-0 z-20 pointer-events-none transition-all duration-500" style={{ left: `${timeLineLeft}px` }}>
                          <div className="absolute w-1.5 h-1.5 bg-[#facc15] rounded-full" style={{ top: "0px", transform: "translate(-50%, -50%)" }} />
                          <div className="absolute inset-y-0 border-l border-[#facc15]" style={{ transform: "translateX(-50%)" }} />
                        </div>
                      )}
                      {timelineGridEvents.map((event) => {
                        const startMins = getMinutesFromStart(event.timeStart);
                        const endMins = getMinutesFromStart(event.timeEnd);
                        const duration = endMins - startMins;
                        const left = startMins * MINUTE_WIDTH;
                        const width = duration * MINUTE_WIDTH;
                        const top = event.trackIndex * TRACK_HEIGHT;
                        return (
                          <div key={event.id} onClick={() => setSelectedEvent(event)} className="absolute bg-[#121212] hover:bg-zinc-800 rounded-2xl px-4 py-2 flex flex-col justify-center cursor-pointer select-none min-w-0 z-10 transition-colors border border-zinc-800" style={{ left: `${left}px`, width: `${Math.max(width, 20)}px`, top: `${top + 4}px`, height: `${TRACK_HEIGHT - 8}px` }}>
                            <span className="text-[11px] font-bold text-[#facc15] leading-tight truncate">{event.title}</span>
                            <span className="text-[8.5px] text-zinc-400 font-semibold truncate">{event.timeStart} - {event.timeEnd}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <EventModal />
    </>
  );
}
