"use client";

import React from "react";
import { useLms } from "../../context/LmsContext";
import { LmsEvent } from "../../types/lms";
import { MapPin, GraduationCap, Plus, Calendar, Clock, Search } from "lucide-react";
import { animate, stagger } from "animejs";

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

const getEventHours = (event: LmsEvent): number => {
  try {
    const [sh, sm] = event.timeStart.split(":").map(Number);
    const [eh, em] = event.timeEnd.split(":").map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;
    return Math.max(0, (endMins - startMins) / 60);
  } catch (e) {
    return 0;
  }
};

const getTimelineDates = (): { label: string; date: string; fullDate: string; isWeekend?: boolean }[] => {
  const today = new Date();
  const startDay = new Date(today);
  startDay.setDate(today.getDate() - 10); // Start 10 days ago

  const weekdayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  return Array.from({ length: 30 }).map((_, idx) => {
    const d = new Date(startDay);
    d.setDate(startDay.getDate() + idx);
    const dateStr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const dateVal = String(d.getDate()).padStart(2, "0");
    const fullDate = `${year}-${month}-${dateVal}`;
    const dayOfWeek = d.getDay();
    return {
      label: weekdayLabels[dayOfWeek],
      date: dateStr,
      fullDate,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    };
  });
};

const getEventDayBounds = (event: LmsEvent, DAYS: { fullDate: string }[], subjects: any[]) => {
  let startDayIdx = -1;
  let endDayIdx = -1;

  if (event.dateStr) {
    startDayIdx = DAYS.findIndex((d) => d.fullDate === event.dateStr);
    endDayIdx = startDayIdx;
  }

  if (event.id && (event.id.startsWith("open-") || event.id.startsWith("deadline-"))) {
    const isOpen = event.id.startsWith("open-");
    const lessonId = event.id.substring(isOpen ? 5 : 9);
    
    const subject = subjects.find((s) => s.id === event.subjectId);
    let lesson: any = null;
    subject?.modules?.forEach((mod: any) => {
      mod.lessons?.forEach((les: any) => {
        if (les.id === lessonId) {
          lesson = les;
        }
      });
    });

    if (lesson) {
      const openDStr = lesson.openDate ? new Date(lesson.openDate).toISOString().split("T")[0] : null;
      const closeDStr = lesson.closeDate ? new Date(lesson.closeDate).toISOString().split("T")[0] : null;

      if (openDStr && closeDStr) {
        const openD = new Date(openDStr);
        const closeD = new Date(closeDStr);
        const startD = new Date(DAYS[0].fullDate);
        const endD = new Date(DAYS[DAYS.length - 1].fullDate);

        if (closeD < startD || openD > endD) {
          return { startDayIdx: -1, endDayIdx: -1 };
        }

        if (openD < startD) {
          startDayIdx = 0;
        } else {
          startDayIdx = DAYS.findIndex((d) => d.fullDate === openDStr);
        }

        if (closeD > endD) {
          endDayIdx = DAYS.length - 1;
        } else {
          endDayIdx = DAYS.findIndex((d) => d.fullDate === closeDStr);
        }
      } else if (openDStr) {
        const openD = new Date(openDStr);
        const startD = new Date(DAYS[0].fullDate);
        const endD = new Date(DAYS[DAYS.length - 1].fullDate);
        if (openD >= startD && openD <= endD) {
          startDayIdx = DAYS.findIndex((d) => d.fullDate === openDStr);
          endDayIdx = startDayIdx;
        } else {
          return { startDayIdx: -1, endDayIdx: -1 };
        }
      } else if (closeDStr) {
        const closeD = new Date(closeDStr);
        const startD = new Date(DAYS[0].fullDate);
        const endD = new Date(DAYS[DAYS.length - 1].fullDate);
        if (closeD >= startD && closeD <= endD) {
          startDayIdx = DAYS.findIndex((d) => d.fullDate === closeDStr);
          endDayIdx = startDayIdx;
        } else {
          return { startDayIdx: -1, endDayIdx: -1 };
        }
      }
    }
  }

  if (startDayIdx === -1) {
    if (event.dayIndex !== undefined && event.dayIndex >= 0 && event.dayIndex < 30) {
      startDayIdx = event.dayIndex;
      endDayIdx = event.dayIndex;
    }
  }

  return { startDayIdx, endDayIdx };
};

const formatEventDate = (event: any) => {
  if (event.openDateVal && event.closeDateVal) {
    try {
      const startD = new Date(event.openDateVal);
      const endD = new Date(event.closeDateVal);
      if (!isNaN(startD.getTime()) && !isNaN(endD.getTime())) {
        const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
        return `${startD.toLocaleDateString("en-US", options)} - ${endD.toLocaleDateString("en-US", options)}`;
      }
    } catch (e) {
      // fallback
    }
  }
  if (event.dateStr) {
    try {
      const d = new Date(event.dateStr);
      if (!isNaN(d.getTime())) {
        const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
        return d.toLocaleDateString("en-US", options);
      }
    } catch (e) {
      // fallback
    }
  }
  return `${event.timeStart} - ${event.timeEnd}`;
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

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 640);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener("resize", handleResize);

    animate(".anime-card", {
      translateY: [24, 0],
      opacity: [0, 1],
      delay: stagger(150),
      duration: 800,
      easing: "easeOutQuad"
    });

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const DAYS = React.useMemo(() => {
    return getTimelineDates();
  }, []);

  const todayIndex = React.useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return DAYS.findIndex((d) => d.fullDate === todayStr);
  }, [DAYS]);

  const scrollToToday = () => {
    if (scrollContainerRef.current && todayIndex !== -1) {
      const scrollPos = todayIndex * 200 - scrollContainerRef.current.clientWidth / 2 + 100;
      scrollContainerRef.current.scrollTo({ left: scrollPos, behavior: "smooth" });
    }
  };

  React.useEffect(() => {
    if (todayIndex !== -1) {
      setActiveDayIndex(todayIndex);
      setTimeout(scrollToToday, 300);
    }
  }, [todayIndex]);

  const filteredEvents = React.useMemo(() => {
    const mapped = events.map((event) => {
      const { startDayIdx, endDayIdx } = getEventDayBounds(event, DAYS, subjects);
      
      let openDateVal = "";
      let closeDateVal = "";
      if (event.id && (event.id.startsWith("open-") || event.id.startsWith("deadline-"))) {
        const isOpen = event.id.startsWith("open-");
        const lessonId = event.id.substring(isOpen ? 5 : 9);
        const subject = subjects.find((s) => s.id === event.subjectId);
        subject?.modules?.forEach((mod: any) => {
          mod.lessons?.forEach((les: any) => {
            if (les.id === lessonId) {
              openDateVal = les.openDate || "";
              closeDateVal = les.closeDate || "";
            }
          });
        });
      }

      return {
        ...event,
        startDayIdx,
        endDayIdx,
        durationDays: startDayIdx !== -1 && endDayIdx !== -1 ? endDayIdx - startDayIdx + 1 : 0,
        openDateVal,
        closeDateVal,
      };
    });

    return mapped.filter((event) => {
      if (event.startDayIdx === -1 || event.endDayIdx === -1) {
        return false;
      }

      if (event.id.startsWith("open-")) {
        const lessonId = event.id.substring(5);
        const hasDeadline = events.some((e) => e.id === `deadline-${lessonId}`);
        if (hasDeadline) return false;
      }

      const matchesSearch =
        searchQuery === "" ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.subtitle && event.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedCategories.length === 0) return true;
      
      const eventCategory = event.tag?.text || "";
      return selectedCategories.some((cat) => {
        const titleLower = event.title.toLowerCase();
        if (cat === "Lectures" && titleLower.includes("lecture")) return true;
        if (cat === "Labs" && titleLower.includes("lab")) return true;
        if (cat === "Seminars" && (titleLower.includes("seminar") || titleLower.includes("office hours"))) return true;
        if (cat === "Quizzes" && (titleLower.includes("quiz") || titleLower.includes("exam") || titleLower.includes("test"))) return true;
        return eventCategory.toLowerCase().includes(cat.toLowerCase());
      });
    });
  }, [events, DAYS, subjects, searchQuery, selectedCategories]);

  // Filter events active for the selected day
  const activeDayEvents = React.useMemo(() => {
    return filteredEvents.filter((e) => e.startDayIdx <= activeDayIndex && e.endDayIdx >= activeDayIndex);
  }, [filteredEvents, activeDayIndex]);

  const DAY_WIDTH = 200;
  const TRACK_HEIGHT = 90;

  const getMonthName = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "long" }).toLowerCase();
  };

  const monthHeaders = React.useMemo(() => {
    const headers: { monthName: string; startIndex: number; span: number }[] = [];
    DAYS.forEach((day, idx) => {
      const mName = getMonthName(day.fullDate);
      if (headers.length === 0 || headers[headers.length - 1].monthName !== mName) {
        if (headers.length > 0) {
          headers[headers.length - 1].span = idx - headers[headers.length - 1].startIndex;
        }
        headers.push({ monthName: mName, startIndex: idx, span: 30 - idx });
      }
    });
    return headers;
  }, [DAYS]);

  // Compute tracks algorithm for overlapping timeline items across all 30 days globally
  const timelineEvents = React.useMemo(() => {
    const sorted = [...filteredEvents].sort((a, b) => {
      if (a.durationDays !== b.durationDays) {
        return a.durationDays - b.durationDays; // shortest duration first
      }
      return a.startDayIdx - b.startDayIdx; // then start day ascending
    });

    const tracks: { endDayIdx: number }[] = [];
    const eventWithTracks = sorted.map((event) => {
      let assignedTrack = -1;
      for (let i = 0; i < tracks.length; i++) {
        if (tracks[i].endDayIdx < event.startDayIdx) {
          assignedTrack = i;
          tracks[i].endDayIdx = event.endDayIdx;
          break;
        }
      }

      if (assignedTrack === -1) {
        assignedTrack = tracks.length;
        tracks.push({ endDayIdx: event.endDayIdx });
      }

      return {
        ...event,
        trackIndex: assignedTrack,
      };
    });

    return {
      events: eventWithTracks,
      totalTracks: Math.max(6, tracks.length),
    };
  }, [filteredEvents]);

  return (
    <div className="flex flex-col flex-1 select-none relative w-full h-[calc(100vh-190px)] no-scrollbar">
      
      {/* Title & Today Button Bar */}
      <div className="anime-card opacity-0 flex justify-between items-center w-full mb-4 px-0.5">
        <div></div>
        <button
          onClick={scrollToToday}
          className="flex items-center gap-1.5 px-4 py-2 bg-zinc-950 hover:bg-zinc-850 text-[#facc15] font-bold rounded-xl text-[10.5px] cursor-pointer transition-all shadow-sm active:scale-95 border border-zinc-900"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Jump to Today</span>
        </button>
      </div>

      {/* Horizontal Timeline Grid (Matching ref.jpg style, full width & height) */}
      <div className="anime-card opacity-0 flex-grow bg-transparent rounded-3xl overflow-hidden relative flex flex-col w-full h-full">
        {/* Faded watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-[0.01] z-0">
          <span className="text-[140px] font-black tracking-tight text-zinc-950 uppercase">
            Timeline
          </span>
        </div>

        {/* Horizontal scroll view wrapper */}
        <div 
          ref={scrollContainerRef}
          className="flex-grow overflow-x-auto overflow-y-auto no-scrollbar flex flex-col relative z-10"
        >
          
          {/* Header Container (80px height: 35px Month + 45px Day) */}
          <div 
            className="relative border-b border-[#E5E1D8]/60 bg-transparent sticky top-0 z-30 shrink-0"
            style={{ width: `${30 * DAY_WIDTH}px`, height: "80px" }}
          >
            {/* Month Headers (Top 35px) */}
            <div className="absolute top-0 left-0 right-0 h-[35px] border-b border-[#E5E1D8]/30 flex items-center">
              {monthHeaders.map((header) => (
                <div
                  key={header.monthName}
                  className="absolute text-left font-bold text-[10px] text-zinc-400 uppercase tracking-wider pl-4"
                  style={{
                    left: `${header.startIndex * DAY_WIDTH}px`,
                    width: `${header.span * DAY_WIDTH}px`,
                  }}
                >
                  {header.monthName}
                </div>
              ))}
            </div>

            {/* Day Headers (Bottom 45px) */}
            <div className="absolute bottom-0 left-0 right-0 h-[45px]">
              {DAYS.map((day, idx) => {
                const isSelected = idx === activeDayIndex;
                const isToday = idx === todayIndex;
                const dateNum = new Date(day.fullDate).getDate();
                const weekdayShort = day.label.toLowerCase();
                return (
                  <div
                    key={day.fullDate}
                    onClick={() => setActiveDayIndex(idx)}
                    className="absolute h-full flex flex-col justify-center items-start pl-4 cursor-pointer group"
                    style={{
                      left: `${idx * DAY_WIDTH}px`,
                      width: `${DAY_WIDTH}px`,
                    }}
                  >
                    <span className={`text-[8.5px] font-bold uppercase tracking-wider transition-colors ${isSelected ? "text-zinc-800" : "text-zinc-400 group-hover:text-zinc-650"}`}>
                      {weekdayShort}
                    </span>
                    <div className="mt-0.5 flex items-center justify-center h-7 w-7 relative">
                      {isToday ? (
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shadow-sm select-none z-10 ${
                          isSelected ? "bg-zinc-950 text-white" : "border-2 border-zinc-950 text-zinc-950 bg-transparent"
                        }`}>
                          {dateNum}
                        </div>
                      ) : isSelected ? (
                        <div className="w-7 h-7 rounded-full bg-zinc-950/80 text-white flex items-center justify-center font-bold text-[11px] shadow-sm select-none z-10">
                          {dateNum}
                        </div>
                      ) : (
                        <span className="text-[11.5px] font-bold text-zinc-700 group-hover:text-zinc-950 transition-colors">
                          {dateNum}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline Body */}
          <div
            className="relative flex-grow bg-transparent"
            style={{
              width: `${30 * DAY_WIDTH}px`,
              height: `${Math.max(6, timelineEvents.totalTracks) * TRACK_HEIGHT + 20}px`,
            }}
          >
            {/* Vertical day columns separator lines */}
            {DAYS.map((_, idx) => (
              <div
                key={`line-${idx}`}
                className="absolute top-0 bottom-0 border-r border-[#E5E1D8]/20 pointer-events-none z-10"
                style={{ left: `${idx * DAY_WIDTH}px` }}
              />
            ))}

            {/* Active day solid vertical line indicator stretching down */}
            <div
              className="absolute top-0 bottom-0 border-l border-zinc-950/60 z-20 pointer-events-none transition-all duration-300"
              style={{ left: `${activeDayIndex * DAY_WIDTH + DAY_WIDTH / 7}px` }}
            />

            {/* Event Cards */}
            <div className="absolute inset-0 pt-4">
              {timelineEvents.events.map((event) => {
                const top = event.trackIndex * TRACK_HEIGHT + 4;
                const left = event.startDayIdx * DAY_WIDTH + 4;
                const width = (event.endDayIdx - event.startDayIdx + 1) * DAY_WIDTH - 8;
                const height = TRACK_HEIGHT - 8;

                let cardClass = "";
                let metaColorClass = "";

                if (event.color === "yellow") {
                  cardClass = "bg-[#facc15] border border-zinc-950/20 text-zinc-950 hover:bg-[#eab308] shadow-sm";
                  metaColorClass = "text-zinc-800";
                } else if (event.id.startsWith("deadline-") || event.color === "blue") {
                  cardClass = "bg-zinc-950 border border-zinc-900 text-white hover:bg-zinc-900 shadow-md";
                  metaColorClass = "text-zinc-400";
                } else {
                  cardClass = "bg-white border border-zinc-200 text-zinc-950 hover:bg-zinc-50 shadow-sm";
                  metaColorClass = "text-zinc-500";
                }

                const hasDate = !!(event.openDateVal || event.dateStr);

                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`absolute rounded-xl p-4 flex flex-col justify-between cursor-pointer select-none transition-all duration-300 hover:scale-[1.01] hover:shadow-md group text-left min-w-0 z-20 ${cardClass}`}
                    style={{
                      left: `${left}px`,
                      width: `${width}px`,
                      top: `${top}px`,
                      height: `${height}px`,
                    }}
                  >
                    <div className="flex flex-col justify-between h-full min-w-0">
                      <span className="text-[12px] font-bold leading-snug break-words line-clamp-2" title={event.title}>
                        {event.title}
                      </span>
                      <div className={`flex items-center gap-1.5 text-[9px] font-semibold mt-auto ${metaColorClass}`}>
                        {hasDate ? (
                          <Calendar className="w-3 h-3 shrink-0" />
                        ) : (
                          <Clock className="w-3 h-3 shrink-0" />
                        )}
                        <span>
                          {formatEventDate(event)}
                        </span>
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
