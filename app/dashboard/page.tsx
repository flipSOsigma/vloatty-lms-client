"use client";

import React, { useState, useEffect } from "react";
import Header from "../../components/views/Header";
import EventModal from "../../components/views/EventModal";
import { useLms } from "../../context/LmsContext";
import {
  ArrowRight,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Subject, LmsEvent } from "../../types/lms";
import StudyActivityChart from "../../components/ui/CourseAnalyticsChart";
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
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
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
      <div className="w-full h-full flex items-center justify-center bg-[#facc15]/10 text-[#d97706] font-bold text-[13px] border border-[#f97316]/15">
        {subject.name.slice(0, 2).toUpperCase()}
      </div>
    );
  };

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

  const todayDayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1;
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

  return (
    <>
      <Header />

      <div className="flex-grow overflow-y-auto pr-1 pb-6 flex flex-col gap-6 text-left select-none w-full no-scrollbar">
        <div className="w-full px-2 md:px-4 flex flex-col gap-6">

          <div className="grid grid-cols-1 lg:grid-cols-10 2xl:grid-cols-4 gap-5 w-full auto-rows-[270px]">

            <div className="anime-card opacity-0 lg:col-span-2 2xl:col-span-1 row-span-1 bg-white border border-[#E5E1D8]/70 rounded-3xl p-5 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] flex flex-col justify-between text-left transition-all duration-300 h-[270px] max-h-[270px] relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-[#facc15]/10 rounded-full filter blur-[20px] pointer-events-none transition-all duration-500" />
              <div className="flex justify-between items-start">
                <span className="text-[9.5px] font-semibold text-zinc-400 tracking-wider"></span>
                <span className="text-[10px] text-zinc-455 font-semibold bg-zinc-50 border border-zinc-200/50 px-2.5 py-0.5 rounded-full">Last 7 Days</span>
              </div>
              <div className="justify-end h-full flex flex-col items-start">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-zinc-800 leading-none tracking-tight">{stats?.weeklyActivity.total ?? 0}</span>
                  <span className="text-[12px] font-semibold text-zinc-455">actions</span>
                  <span className="bg-[#facc15]/40 text-zinc-800 text-[9px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5 self-center">Live</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-semibold mt-3 leading-snug">Activities in Lesson, Modules, and Subjects</span>
              </div>
              <div className=" pt-5 mt-6 grid grid-cols-3 gap-2">
                <div className="flex flex-col">
                  <span className="text-[18px] font-semibold text-zinc-800 leading-none">{stats?.weeklyActivity.subjects ?? 0}</span>
                  <span className="text-[9px] text-zinc-400 font-semibold mt-1">Subjects</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[18px] font-semibold text-zinc-800 leading-none">{stats?.weeklyActivity.modules ?? 0}</span>
                  <span className="text-[9px] text-zinc-400 font-semibold mt-1">Modules</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[18px] font-semibold text-zinc-800 leading-none">{stats?.weeklyActivity.lessons ?? 0}</span>
                  <span className="text-[9px] text-zinc-400 font-semibold mt-1">Lessons</span>
                </div>
              </div>
            </div>

            <div className="anime-card opacity-0 lg:col-span-2 2xl:col-span-1 row-span-1 bg-white border border-[#E5E1D8]/70 rounded-3xl p-5 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] flex flex-col gap-3 text-left transition-all duration-300 h-[270px] max-h-[270px] justify-between overflow-hidden group">
              <div className="flex justify-between items-center">
                <span className="text-[9.5px] font-semibold text-zinc-400 tracking-wider"></span>
                <span className="text-[10px] text-zinc-455 font-semibold bg-zinc-50 border border-zinc-200/50 px-2.5 py-0.5 rounded-full">200 MB Limit</span>
              </div>
              <div className="flex flex-col gap-3.5 w-full h-full justify-end">
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-semibold text-zinc-800 leading-none">{stats ? formatFileSize(stats.storage.usedBytes) : "82 MB"}</span>
                  <span className="text-[11.5px] font-semibold text-zinc-455">/ {stats ? formatFileSize(stats.storage.maxBytes) : "200 MB"} used</span>
                </div>
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden mt-1">
                  <div className="bg-[#facc15] h-full rounded-full transition-all duration-500 shadow-sm" style={{ width: `${stats ? Math.round((stats.storage.usedBytes / stats.storage.maxBytes) * 100) : 41}%` }} />
                </div>
                <span className="text-[9px] text-zinc-400 font-semibold">{stats ? Math.round((stats.storage.usedBytes / stats.storage.maxBytes) * 100) : 41}% storage quota utilized</span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-[10.5px] font-semibold transition-all">Manage Files</button>
                <button className="flex-1 py-2 bg-[#facc15] text-zinc-800 rounded-xl text-[10.5px] font-semibold transition-all">Upgrade</button>
              </div>
            </div>

            <div className="anime-card opacity-0 lg:col-span-4 2xl:col-span-2 bg-white border border-[#E5E1D8]/70 rounded-3xl p-5 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] flex flex-col justify-between text-left transition-all duration-300 relative">
              <div className="w-full flex-grow min-h-[160px] flex flex-col justify-between h-full">
                <StudyActivityChart events={events} />
              </div>
            </div>

            <div className="anime-card opacity-0 lg:col-span-2 2xl:col-span-1 row-span-1 bg-white border border-dashed border-[#E5E1D8]/70 rounded-3xl p-5 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] flex flex-col text-left transition-all duration-300 h-[270px] max-h-[270px] overflow-hidden group">
              <span className="text-[9.5px] font-semibold text-zinc-400 tracking-wider">New Slot</span>
              <div className="flex-1 flex items-center justify-center text-zinc-300">
                <span className="text-[12px] font-medium">Placeholder</span>
              </div>
            </div>

            <div className="anime-card opacity-0 lg:col-span-4 2xl:col-span-2 row-span-1 bg-white border border-[#E5E1D8]/70 rounded-xl p-4 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] flex flex-col text-left transition-all duration-300 h-[270px] max-h-[270px] overflow-hidden">
              <div className="relative flex flex-col flex-1 overflow-hidden">
                <div className="flex-1 overflow-x-auto overflow-y-hidden no-scrollbar">
                  <div className="relative" style={{ width: `${HOURS.length * HOUR_WIDTH}px`, height: "100%", minHeight: `${totalTracks * TRACK_HEIGHT + 20}px` }}>
                    <div className="flex sticky top-0 z-10 shrink-0">
                      {HOURS.map((hour) => (
                        <div key={hour} className="text-left text-[9px] text-zinc-300 font-medium pb-1.5 select-none shrink-0" style={{ width: `${HOUR_WIDTH}px` }}>{hour}</div>
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
                          <div key={event.id} onClick={() => setSelectedEvent(event)} className="absolute bg-linear-to-r from-black to-black duration-300 to-100% hover:to-80% hover:to-orange-400 rounded-lg px-4 py-2 flex flex-col justify-center cursor-pointer select-none min-w-0 z-10 transition-colors" style={{ left: `${left}px`, width: `${Math.max(width, 20)}px`, top: `${top + 4}px`, height: `${TRACK_HEIGHT - 8}px` }}>
                            <span className="text-[11px] font-semibold text-yellow-400 leading-tight truncate">{event.title}</span>
                            <span className="text-[8.5px] text-zinc-400 font-medium truncate">{event.timeStart} - {event.timeEnd}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="anime-card opacity-0 lg:col-span-2 2xl:col-span-1 row-span-1 bg-white border border-[#E5E1D8]/70 rounded-3xl p-5 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] flex flex-col justify-between text-left transition-all duration-300 h-[270px] max-h-[270px] relative overflow-hidden group">
              <div className="flex justify-between items-start">
                <span className="text-[9.5px] font-semibold text-zinc-400 tracking-wider">Calendar</span>
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
                <span className="text-2xl font-semibold text-zinc-800 tracking-tight leading-none uppercase">
                  {monthNames[currentCalendarDate.getMonth()].slice(0, 3)} {currentCalendarDate.getFullYear()}
                </span>
                <span className="text-[10px] text-zinc-400 font-semibold mt-1">
                  Selected: {selectedCalendarDay.getDate()} {monthNames[selectedCalendarDay.getMonth()].slice(0, 3)} {selectedCalendarDay.getFullYear()}
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
                        title={cell.date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="anime-card opacity-0 lg:col-span-2 2xl:col-span-2 row-span-1 bg-white border border-[#E5E1D8]/70 rounded-3xl p-5 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] flex flex-col gap-3 text-left transition-all duration-300 h-[270px] max-h-[270px]">
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-semibold text-zinc-800">Active Classes</span>
                <span className="text-[10px] text-zinc-400 font-semibold">{joinedSubjects.length} Courses</span>
              </div>
              <div className="flex flex-col gap-2 overflow-y-auto pr-1 no-scrollbar flex-grow">
                {joinedSubjects.map((subject) => (
                  <div key={subject.id} onClick={() => window.location.href = `/dashboard/subject/${subject.id}`} className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-white border border-zinc-100/40 cursor-pointer group">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl overflow-hidden bg-zinc-50 border border-zinc-200/60 flex-shrink-0 relative"><SubjectThumbnail subject={subject} /></div>
                      <div className="flex flex-col min-w-0 text-left">
                        <h4 className="text-[11px] font-semibold text-zinc-800 truncate leading-snug">{subject.name}</h4>
                        <span className="text-[9px] text-zinc-400 font-semibold truncate">{subject.lecturers?.map((l) => l.name.split(" ")[0]).join(", ") || "Unknown"}</span>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#facc15]/15 group-hover:bg-[#facc15] flex items-center justify-center text-zinc-800 transition-colors flex-shrink-0"><ArrowRight className="w-3 h-3" /></div>
                  </div>
                ))}
                {joinedSubjects.length === 0 && (
                  <div className="py-6 text-center text-zinc-400 text-[10.5px] font-semibold border border-dashed border-[#E5E1D8]/80 rounded-2xl bg-white/40">No subjects found</div>
                )}
              </div>
            </div>

            <div className="anime-card opacity-0 lg:col-span-2 2xl:col-span-2 row-span-1 bg-white border border-[#E5E1D8]/70 rounded-3xl p-5 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] flex flex-col gap-3 text-left transition-all duration-300 h-[270px] max-h-[270px]">
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-semibold text-zinc-800">My Classes</span>
                <span className="text-[10px] text-zinc-400 font-semibold">{createdSubjects.length} Courses</span>
              </div>
              <div className="flex flex-col gap-2 overflow-y-auto pr-1 no-scrollbar flex-grow">
                {createdSubjects.map((subject) => (
                  <div key={subject.id} onClick={() => window.location.href = `/dashboard/subject/${subject.id}`} className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-white border border-zinc-100/40 cursor-pointer group">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl overflow-hidden bg-zinc-50 border border-zinc-200/60 flex-shrink-0 relative"><SubjectThumbnail subject={subject} /></div>
                      <div className="flex flex-col min-w-0 text-left">
                        <h4 className="text-[11px] font-semibold text-zinc-800 truncate leading-snug">{subject.name}</h4>
                        <span className="text-[9px] text-zinc-400 font-semibold truncate">{subject.lecturers?.map((l) => l.name.split(" ")[0]).join(", ") || "Unknown"}</span>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#facc15]/15 group-hover:bg-[#facc15] flex items-center justify-center text-zinc-800 transition-colors flex-shrink-0"><ArrowRight className="w-3 h-3" /></div>
                  </div>
                ))}
                {createdSubjects.length === 0 && (
                  <div className="py-6 text-center text-zinc-400 text-[10.5px] font-semibold border border-dashed border-[#E5E1D8]/80 rounded-2xl bg-white/40">No subjects found</div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      <EventModal />
    </>
  );
}
