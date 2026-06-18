"use client";

import React from "react";
import { useLms } from "../../context/LmsContext";
import { LmsEvent } from "../../types/lms";
import { MapPin, GraduationCap, Plus, Calendar, Clock, Search } from "lucide-react";

const getWeekNumber = (d: Date): number => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

const getWeekDates = (): { label: string; date: string; fullDate: string; isPink?: boolean }[] => {
  const today = new Date();
  const currentDay = today.getDay();
  const dayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  
  const monday = new Date(today);
  monday.setDate(today.getDate() + dayOffset);

  const labels = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  return Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const dateStr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const dateVal = String(d.getDate()).padStart(2, "0");
    const fullDate = `${year}-${month}-${dateVal}`;
    return {
      label: labels[idx],
      date: dateStr,
      fullDate,
      isPink: idx === 6,
    };
  });
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
  "20:00",
  "21:05",
];

const START_HOUR = 7;
const HOUR_WIDTH = 180;
const MINUTE_WIDTH = HOUR_WIDTH / 60;
const TRACK_HEIGHT = 85;

const getMinutesFromStart = (timeStr: string): number => {
  const [h, m] = timeStr.split(":").map(Number);
  const totalMins = h * 60 + m;
  const startMins = START_HOUR * 60;
  return totalMins - startMins;
};

export default function ScheduleView() {
  const {
    subjects,
    events,
    activeDayIndex,
    setActiveDayIndex,
    currentTime,
    searchQuery,
    selectedCategories,
    setSelectedEvent,
  } = useLms();

  const [mounted, setMounted] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 640);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const DAYS = React.useMemo(() => {
    if (!mounted) {
      return [
        { label: "MON", date: "11/05", fullDate: "2026-05-11" },
        { label: "TUE", date: "12/05", fullDate: "2026-05-12" },
        { label: "WED", date: "13/05", fullDate: "2026-05-13" },
        { label: "THU", date: "14/05", fullDate: "2026-05-14" },
        { label: "FRI", date: "15/05", fullDate: "2026-05-15" },
        { label: "SAT", date: "16/05", fullDate: "2026-05-16" },
        { label: "SUN", date: "17/05", fullDate: "2026-05-17", isPink: true },
      ];
    }
    return getWeekDates();
  }, [mounted]);

  const currentWeekNumber = React.useMemo(() => {
    if (!mounted) return 24;
    return getWeekNumber(new Date());
  }, [mounted]);

  const filteredEvents = React.useMemo(() => {
    const mapped = events.map((event) => {
      if (event.dateStr) {
        const dayIdx = DAYS.findIndex((d) => d.fullDate === event.dateStr);
        if (dayIdx !== -1) {
          return { ...event, dayIndex: dayIdx };
        }
        return { ...event, dayIndex: -1 };
      }
      return event;
    });

    return mapped.filter((event) => {
      if (event.dateStr && event.dayIndex === -1) {
        return false;
      }

      const matchesSearch =
        searchQuery === "" ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.subtitle && event.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));

      if (selectedCategories.length === 0) return matchesSearch;
      
      const eventCategory = event.tag?.text || "";
      const isMatchedCat = selectedCategories.some((cat) => {
        const titleLower = event.title.toLowerCase();
        if (cat === "Lectures" && titleLower.includes("lecture")) return true;
        if (cat === "Labs" && titleLower.includes("lab")) return true;
        if (cat === "Seminars" && (titleLower.includes("seminar") || titleLower.includes("office hours"))) return true;
        if (cat === "Quizzes" && (titleLower.includes("quiz") || titleLower.includes("exam") || titleLower.includes("test"))) return true;
        return eventCategory.toLowerCase().includes(cat.toLowerCase());
      });

      return matchesSearch && isMatchedCat;
    });
  }, [events, DAYS, searchQuery, selectedCategories]);

  // Filter events active for the selected day
  const activeDayEvents = React.useMemo(() => {
    return filteredEvents.filter((e) => e.dayIndex === activeDayIndex);
  }, [filteredEvents, activeDayIndex]);

  // Compute tracks algorithm for overlapping timeline items
  const { events: timelineEvents, totalTracks } = React.useMemo(() => {
    const sorted = [...activeDayEvents].sort((a, b) => {
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
      events: eventWithTracks,
      totalTracks: Math.max(1, tracks.length),
    };
  }, [activeDayEvents]);

  const curMins = getMinutesFromStart(currentTime);
  const timeLineLeft = curMins * MINUTE_WIDTH;

  return (
    <div className="flex flex-col flex-1 select-none relative gap-6 no-scrollbar ">
      
      {/* Title section */}
      {/* <div className="flex flex-col text-left select-none pb-1 border-b border-zinc-100">
        <h1 className="text-2xl font-black text-[#121212] tracking-tight">Schedule Timeline</h1>
        <span className="text-[11.5px] text-zinc-400 font-bold mt-0.5">
          Tuesday 10 November 2026
        </span>
      </div> */}

      {/* Top row of event card summaries */}
      {activeDayEvents.length > 0 && (
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3 select-none">
          {activeDayEvents.map((event) => {
            const subject = subjects.find((s) => s.id === event.subjectId);
            return (
              <div
                key={`top-${event.id}`}
                onClick={() => setSelectedEvent(event)}
                className="min-w-60 bg-white border border-[#E5E1D8]/70 hover:border-[#E5E1D8] rounded-2xl p-4.5 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-full bg-[#facc15]/10 text-[#d97706] flex items-center justify-center font-black text-[10px]">
                    {subject?.name?.slice(0, 2).toUpperCase() || "EV"}
                  </div>
                    <span className="text-[8.5px] font-semibold text-zinc-400 bg-zinc-50 border border-zinc-200/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {event.tag?.text || "Class"}
                    </span>
                </div>
                <div className="mt-4 flex flex-col gap-0.5">
                  <h4 className="text-[13px] font-semibold text-zinc-800 leading-snug truncate group-hover:text-[#d97706] transition-colors">
                    {event.title}
                  </h4>
                  <span className="text-[9.5px] text-zinc-400 font-semibold">
                    Last update: Today, {event.timeStart}
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-100/60 flex items-center justify-between text-[10px] font-semibold">
                  <span className="text-[#d97706] tracking-wide">
                    {event.timeStart} - {event.timeEnd}
                  </span>
                  <span className="text-zinc-400 truncate max-w-20">
                    {event.subtitle || "Online"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Week Day strip selector */}
      <div className="flex items-center pb-2 justify-between rounded-2xl shrink-0">
        <div className="flex flex-1 justify-center gap-8 overflow-x-auto no-scrollbar scroll-smooth">
          {DAYS.map((day, idx) => {
            const isActive = idx === activeDayIndex;
            const label = day.label.charAt(0) + day.date.split("/")[0];
            return (
              <div
                key={day.label}
                onClick={() => setActiveDayIndex(idx)}
                className="flex justify-center items-center cursor-pointer select-none transition-all py-1"
              >
                  {isActive ? (
                  <div className="flex flex-col items-center justify-center px-2 relative">
                    <span className="text-[12.5px] font-semibold text-[#d97706] tracking-widest">
                      {label}
                    </span>
                    <span className="absolute -bottom-1 w-6 h-0.75 bg-[#facc15] rounded-full" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center px-2 hover:opacity-80">
                    <span className="text-[12.5px] font-semibold text-zinc-400 tracking-widest hover:text-zinc-600 transition-colors">
                      {label}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Horizontal timeline scheduler container */}
      <div className="flex-1 border border-[#E5E1D8]/70 bg-white rounded-3xl overflow-hidden shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] relative flex flex-col">
        {/* Faded watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-[0.015] z-0">
          <span className="text-[180px] font-black tracking-tight text-zinc-950 uppercase">
            Schedule
          </span>
        </div>

        {/* Horizontal scroll view wrapper */}
        <div className="flex-1 overflow-x-auto overflow-y-auto no-scrollbar flex flex-col relative z-10">
          
          {/* Hour Headers */}
          <div
            className="flex border-b border-[#E5E1D8]/60 bg-zinc-55 bg-zinc-50/70 backdrop-blur-sm sticky top-0 z-30"
            style={{ width: `${HOURS.length * HOUR_WIDTH}px` }}
          >
            {HOURS.map((hour, idx) => (
              <div
                key={hour}
                className="text-left font-extrabold text-[10.5px] text-zinc-400 py-3 pl-4 border-r border-[#E5E1D8]/20 select-none shrink-0"
                style={{ width: `${HOUR_WIDTH}px` }}
              >
                {hour}
              </div>
            ))}
          </div>

          {/* Timeline Body grid content */}
          <div
            className="relative flex-1"
            style={{
              width: `${HOURS.length * HOUR_WIDTH}px`,
              height: `${totalTracks * TRACK_HEIGHT + 60}px`,
              backgroundImage: "radial-gradient(#E5E1D8 1px, transparent 0)",
              backgroundSize: "24px 24px"
            }}
          >
            {/* Vertical hour marker lines */}
            {HOURS.map((hour, idx) => (
              <div
                key={`line-${hour}`}
                className="absolute top-0 bottom-0 border-r border-[#E5E1D8]/20 pointer-events-none z-10"
                style={{ left: `${idx * HOUR_WIDTH}px` }}
              />
            ))}

            {/* Current Time red indicator line */}
            {timeLineLeft >= 0 && timeLineLeft <= HOURS.length * HOUR_WIDTH && (
              <div
                className="absolute top-0 bottom-0 border-l-2 border-dashed border-[#f97316] z-25 pointer-events-none transition-all duration-500"
                style={{ left: `${timeLineLeft}px` }}
              >
                {/* indicator dot at top */}
                <div
                  className="absolute w-2.5 h-2.5 bg-[#facc15] rounded-full z-30 transition-all duration-500 shadow-sm"
                  style={{ top: "0px", transform: "translate(-50%, -50%)" }}
                >
                  <div className="absolute w-full h-full bg-[#facc15] rounded-full animate-ping opacity-75" />
                </div>
                {/* indicator badge at top */}
                <div
                  className="absolute bg-[#facc15] text-white text-[9.5px] font-black px-2.5 py-0.5 rounded-full shadow-md z-30 transition-all duration-500"
                  style={{ top: "10px", transform: "translateX(-50%)" }}
                >
                  {currentTime}
                </div>
              </div>
            )}

            {/* Event Pill Cards */}
            <div className="absolute inset-0 pt-6 px-1">
              {timelineEvents.map((event) => {
                const startMins = getMinutesFromStart(event.timeStart);
                const endMins = getMinutesFromStart(event.timeEnd);
                const duration = endMins - startMins;

                const left = startMins * MINUTE_WIDTH;
                const width = duration * MINUTE_WIDTH;
                const top = event.trackIndex * TRACK_HEIGHT;

                const subject = subjects.find((s) => s.id === event.subjectId);
                const lecturerName = subject ? subject.lecturers.map((l) => l.name).join(", ") : undefined;

                const isHexColor = event.color && event.color.startsWith("#");
                
                let accentColor = "#facc15";
                let badgeClass = "bg-[#facc15]/10 text-[#d97706] border-[#f97316]/20";
                
                if (event.color === "yellow") {
                  accentColor = "#E6A23C";
                  badgeClass = "bg-amber-100 text-amber-800 border-amber-200";
                } else if (event.color === "blue") {
                  accentColor = "#409EFF";
                  badgeClass = "bg-blue-100 text-blue-800 border-blue-200";
                } else if (isHexColor) {
                  accentColor = event.color;
                  badgeClass = "bg-zinc-100 text-zinc-800 border-zinc-200";
                }

                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="absolute bg-white hover:bg-zinc-50 border border-[#E5E1D8]/80 hover:border-zinc-300 shadow-sm rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer select-none transition-all duration-200 group text-left min-w-0 z-20"
                    style={{
                      left: `${left}px`,
                      width: `${width}px`,
                      top: `${top}px`,
                      height: `${TRACK_HEIGHT - 12}px`,
                      borderLeft: `4px solid ${accentColor}`
                    }}
                  >
                    <div className="flex flex-col justify-between h-full min-w-0">
                      <div className="flex items-start justify-between gap-2.5 min-w-0">
                        <span className="text-[12px] font-extrabold text-zinc-850 leading-tight line-clamp-1 truncate group-hover:text-[#d97706] transition-colors" title={event.title}>
                          {event.title}
                        </span>
                        <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded-full border shrink-0 ${badgeClass}`}>
                          {event.tag?.text || "Class"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5 mt-auto">
                        <div className="flex items-center gap-1.5 text-zinc-500 text-[9px] font-semibold truncate">
                          <Clock className="w-3 h-3 text-zinc-400 shrink-0" />
                          <span>
                            {event.timeStart} - {event.timeEnd}
                          </span>
                        </div>
                        {event.subtitle && (
                          <div className="flex items-center gap-1.5 text-zinc-500 text-[9px] font-semibold truncate">
                            <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                            <span className="truncate text-left">{event.subtitle}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
