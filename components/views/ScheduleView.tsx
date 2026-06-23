"use client";

import React from "react";
import { useLms } from "../../context/LmsContext";
import { LmsEvent } from "../../types/lms";
import {
  Calendar,
  Clock,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  SlidersHorizontal,
} from "lucide-react";
import { animate, stagger } from "animejs";

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

const getAvatarsForEvent = (eventId: string) => {
  const images = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&fit=crop&auto=format&q=80",
  ];
  const charSum = eventId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const count = (charSum % 2) + 1; // 1 or 2 avatars
  const startIdx = charSum % (images.length - 1);
  return images.slice(startIdx, startIdx + count);
};

const getBezierPath = (x1: number, y1: number, x2: number, y2: number) => {
  const controlOffset = Math.min(60, (x2 - x1) / 2);
  return `M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${x2 - controlOffset} ${y2}, ${x2} ${y2}`;
};

export default function ScheduleView() {
  const {
    subjects,
    events,
    activeDayIndex,
    setActiveDayIndex,
    searchQuery,
    selectedCategories,
    toggleCategory,
    setSelectedEvent,
  } = useLms();

  const [mounted, setMounted] = React.useState(false);
  const [activeViewMode, setActiveViewMode] = React.useState<"Day" | "Week" | "Month">("Month");
  const [showDone, setShowDone] = React.useState(true);
  const [sortBy, setSortBy] = React.useState<"date" | "duration">("date");
  const [filterDropdownOpen, setFilterDropdownOpen] = React.useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = React.useState(false);

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);

    animate(".anime-card", {
      translateY: [24, 0],
      opacity: [0, 1],
      delay: stagger(150),
      duration: 800,
      easing: "easeOutQuad"
    });
  }, []);

  const DAYS = React.useMemo(() => {
    return getTimelineDates();
  }, []);

  const todayIndex = React.useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return DAYS.findIndex((d) => d.fullDate === todayStr);
  }, [DAYS]);

  const dateRangeText = React.useMemo(() => {
    if (DAYS.length === 0) return "";
    const start = new Date(DAYS[0].fullDate);
    const end = new Date(DAYS[DAYS.length - 1].fullDate);
    const startStr = start.toLocaleDateString("en-US", { day: "numeric", month: "short" });
    const endStr = end.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
    return `${startStr} - ${endStr}`;
  }, [DAYS]);

  const scrollToToday = () => {
    if (scrollContainerRef.current && todayIndex !== -1) {
      const scrollPos = todayIndex * 200 - scrollContainerRef.current.clientWidth / 2 + 100;
      scrollContainerRef.current.scrollTo({ left: scrollPos, behavior: "smooth" });
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
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
  const visibleFilteredEvents = React.useMemo(() => {
    return filteredEvents.filter((event) => {
      if (showDone) return true;
      return event.endDayIdx >= todayIndex;
    });
  }, [filteredEvents, showDone, todayIndex]);

  const DAY_WIDTH = 200;
  const TRACK_HEIGHT = 90;

  const getMonthName = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
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

  const timelineEvents = React.useMemo(() => {
    const sorted = [...visibleFilteredEvents].sort((a, b) => {
      if (sortBy === "duration") {
        if (a.durationDays !== b.durationDays) {
          return a.durationDays - b.durationDays;
        }
      }
      return a.startDayIdx - b.startDayIdx;
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
  }, [visibleFilteredEvents, sortBy]);

  const connections = React.useMemo(() => {
    const list: { fromId: string; toId: string; color: string }[] = [];
    const subjectGroups: { [key: string]: typeof visibleFilteredEvents } = {};
    visibleFilteredEvents.forEach(e => {
      if (e.subjectId) {
        if (!subjectGroups[e.subjectId]) subjectGroups[e.subjectId] = [];
        subjectGroups[e.subjectId].push(e);
      }
    });

    Object.values(subjectGroups).forEach(group => {
      const sortedGroup = [...group].sort((a, b) => a.startDayIdx - b.startDayIdx);
      for (let i = 0; i < sortedGroup.length - 1; i++) {
        const from = sortedGroup[i];
        const to = sortedGroup[i + 1];
        if (to.startDayIdx > from.endDayIdx && to.startDayIdx - from.endDayIdx < 8) {
          list.push({
            fromId: from.id,
            toId: to.id,
            color: from.color === "yellow" ? "#a855f7" : from.color === "blue" || from.id.startsWith("deadline-") ? "#3b82f6" : "#10b981",
          });
          if (list.length >= 3) break;
        }
      }
    });
    return list;
  }, [visibleFilteredEvents]);

  const categories = ["Lectures", "Labs", "Seminars", "Quizzes"];

  return (
    <div className="flex flex-col flex-1 select-none relative w-full h-[calc(100vh-190px)] no-scrollbar">
      
      {/* Title & Description row */}
      <div className="mb-6 text-left">
        <h1 className="text-[28px] font-black text-zinc-950 tracking-tight">Timeline</h1>
        <p className="text-[12.5px] text-zinc-500 font-semibold max-w-2xl mt-1 leading-snug">
          Detailed, visual representation of a project's journey, highlighting key milestones, progress updates, and upcoming tasks.
        </p>
      </div>

      {/* Timeline Controls Bar (Match ref.jpg structure & premium theme style) */}
      <div className="anime-card opacity-0 flex flex-wrap justify-between items-center gap-4 w-full mb-6 px-0.5 relative z-40">
        
        {/* Left Side: View Mode Tabs & Navigation Arrows with Date Range */}
        <div className="flex items-center gap-3">
          {/* Day / Week / Month Pill Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-[#EFECE6] shadow-2xs">
            {(["Day", "Week", "Month"] as const).map((view) => (
              <button
                key={view}
                onClick={() => setActiveViewMode(view)}
                className={`px-4 py-1.5 rounded-full text-[11.5px] font-extrabold tracking-tight transition-all cursor-pointer ${
                  activeViewMode === view
                    ? "bg-[#121212] text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                {view}
              </button>
            ))}
          </div>

          {/* Date range display & navigation arrows */}
          <div className="flex items-center bg-white rounded-full border border-[#EFECE6] shadow-2xs px-3 py-1.5 text-[11.5px] font-extrabold text-zinc-700">
            <button 
              onClick={scrollLeft} 
              className="hover:text-zinc-950 cursor-pointer p-0.5 transition-colors"
              title="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="min-w-[130px] text-center select-none tracking-tight px-1 text-zinc-950 font-extrabold">
              {dateRangeText}
            </span>
            <button 
              onClick={scrollRight} 
              className="hover:text-zinc-950 cursor-pointer p-0.5 transition-colors"
              title="Scroll Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Side: Toggle Done, Sort & Filter dropdown triggers, Jump to Today */}
        <div className="flex items-center gap-3">
          
          {/* Show done toggle */}
          <div className="flex items-center gap-2 text-[11.5px] font-extrabold text-zinc-500 mr-2">
            <span>Show done</span>
            <button
              onClick={() => setShowDone(!showDone)}
              className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer relative ${
                showDone ? "bg-zinc-950" : "bg-zinc-200"
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  showDone ? "translate-x-3.5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Sort Button Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setSortDropdownOpen(!sortDropdownOpen);
                setFilterDropdownOpen(false);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-zinc-50 text-zinc-750 font-extrabold rounded-full text-[11.5px] cursor-pointer border border-[#EFECE6] shadow-2xs active:scale-95 transition-all ${
                sortDropdownOpen ? "border-zinc-950 text-zinc-950" : ""
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Sort</span>
            </button>

            {sortDropdownOpen && (
              <div className="absolute right-0 mt-2 bg-white border border-[#EFECE6] rounded-2xl p-2.5 shadow-xl z-50 flex flex-col gap-1 w-44">
                <div className="text-[9.5px] font-black text-zinc-400 uppercase tracking-widest px-2 mb-1.5">
                  Sort Timeline
                </div>
                {(["date", "duration"] as const).map((mode) => {
                  const isSelected = sortBy === mode;
                  return (
                    <button
                      key={mode}
                      onClick={() => {
                        setSortBy(mode);
                        setSortDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-left cursor-pointer transition-colors ${
                        isSelected ? "bg-[#121212] text-white" : "hover:bg-zinc-50 text-zinc-650"
                      }`}
                    >
                      <span>{mode === "date" ? "Start Date" : "Task Duration"}</span>
                      {isSelected && <span className="text-[10px]">✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Filter Button Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setFilterDropdownOpen(!filterDropdownOpen);
                setSortDropdownOpen(false);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-zinc-50 text-zinc-750 font-extrabold rounded-full text-[11.5px] cursor-pointer border border-[#EFECE6] shadow-2xs active:scale-95 transition-all ${
                filterDropdownOpen ? "border-zinc-950 text-zinc-950" : ""
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>

            {filterDropdownOpen && (
              <div className="absolute right-0 mt-2 bg-white border border-[#EFECE6] rounded-2xl p-2.5 shadow-xl z-50 flex flex-col gap-1 w-44">
                <div className="text-[9.5px] font-black text-zinc-400 uppercase tracking-widest px-2 mb-1.5">
                  Filter by Tag
                </div>
                {categories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-left cursor-pointer transition-colors ${
                        isSelected ? "bg-[#121212] text-white" : "hover:bg-zinc-50 text-zinc-650"
                      }`}
                    >
                      <span>{cat}</span>
                      {isSelected && <span className="text-[10px]">✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Jump to Today Button */}
          <button
            onClick={scrollToToday}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#121212] hover:bg-zinc-900 text-white font-extrabold rounded-full text-[11.5px] cursor-pointer transition-all shadow-xs active:scale-95"
          >
            <Calendar className="w-3.5 h-3.5 text-[#facc15]" />
            <span>Jump to Today</span>
          </button>
        </div>

      </div>

      {/* Horizontal Timeline Grid Card Frame (Transparent, integrated directly into page) */}
      <div className="anime-card opacity-0 flex-grow bg-transparent overflow-hidden relative flex flex-col w-full h-full">
        
        {/* Faded watermark behind grid lanes */}
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
            className="relative border-b border-[#EFECE6] sticky top-0 z-30 shrink-0"
            style={{ width: `${30 * DAY_WIDTH}px`, height: "80px" }}
          >
            {/* Month Headers (Top 35px) */}
            <div className="absolute top-0 left-0 right-0 h-[35px] border-b border-[#EFECE6] flex items-center bg-[#FAF7F2]/90 backdrop-blur-xs">
              {monthHeaders.map((header) => (
                <div
                  key={header.monthName}
                  className="absolute text-left font-black text-[11px] text-zinc-950 uppercase tracking-widest pl-5"
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
            <div className="absolute bottom-0 left-0 right-0 h-[45px] bg-[#FAF7F2]/60 backdrop-blur-xs">
              {DAYS.map((day, idx) => {
                const isSelected = idx === activeDayIndex;
                const isToday = idx === todayIndex;
                const dateNum = new Date(day.fullDate).getDate();
                const weekdayLetter = day.label[0];
                return (
                  <div
                    key={day.fullDate}
                    onClick={() => setActiveDayIndex(idx)}
                    className="absolute h-full flex items-center justify-between px-4 cursor-pointer group"
                    style={{
                      left: `${idx * DAY_WIDTH}px`,
                      width: `${DAY_WIDTH}px`,
                    }}
                  >
                    <div className="flex items-center gap-2 select-none">
                      <span className={`text-[11px] font-extrabold transition-colors ${
                        isSelected ? "text-[#121212]" : "text-zinc-400 group-hover:text-zinc-650"
                      }`}>
                        {weekdayLetter}
                      </span>
                      
                      <div className="flex items-center justify-center relative">
                        {isToday ? (
                          <div className={`h-6 px-2 rounded-full flex items-center justify-center font-black text-[11px] transition-all shadow-xs border ${
                            isSelected 
                              ? "bg-[#121212] border-[#121212] text-white" 
                              : "bg-[#facc15]/15 border-[#facc15]/80 text-[#d97706] font-black"
                          }`}>
                            {dateNum}
                          </div>
                        ) : isSelected ? (
                          <div className="h-6 px-2 rounded-full bg-[#121212] text-white flex items-center justify-center font-black text-[11px] shadow-xs border border-[#121212]">
                            {dateNum}
                          </div>
                        ) : (
                          <span className="text-[11.5px] font-extrabold text-zinc-700 group-hover:text-zinc-950 transition-colors">
                            {dateNum}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Small dots separator on the right of header cell */}
                    {idx < DAYS.length - 1 && (
                      <div className="flex items-center justify-between pl-6 w-full gap-1.5 ml-auto opacity-70">
                        <div className="w-1 h-1 rounded-full bg-black/40" />
                        <div className="w-1 h-1 rounded-full bg-black/40" />
                        <div className="w-1 h-1 rounded-full bg-black/40" />
                      </div>
                    )}

                    {/* Blue/indigo active top underline in header */}
                    {isSelected && (
                      <div className="absolute bottom-0 left-4 right-4 h-0.75 bg-indigo-500 rounded-t-full z-20" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline Body */}
          <div
            className="relative flex-grow"
            style={{
              width: `${30 * DAY_WIDTH}px`,
              height: `${Math.max(6, timelineEvents.totalTracks) * TRACK_HEIGHT + 20}px`,
              backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(239, 236, 230, 0.45) 12px, rgba(239, 236, 230, 0.45) 24px)"
            }}
          >
            {/* Vertical day columns separator lines */}
            {DAYS.map((_, idx) => (
              <div
                key={`line-${idx}`}
                className="absolute top-0 bottom-0 border-r border-[#EFECE6]/45 pointer-events-none z-10"
                style={{ left: `${idx * DAY_WIDTH}px` }}
              />
            ))}

            {/* Connection SVG Paths */}
            <svg className="absolute inset-0 pointer-events-none z-10" style={{ width: `${30 * DAY_WIDTH}px`, height: "100%" }}>
              {connections.map((conn, idx) => {
                const fromEvent = timelineEvents.events.find(e => e.id === conn.fromId);
                const toEvent = timelineEvents.events.find(e => e.id === conn.toId);
                if (!fromEvent || !toEvent) return null;

                const x1 = (fromEvent.endDayIdx + 1) * DAY_WIDTH - 4;
                const y1 = fromEvent.trackIndex * TRACK_HEIGHT + TRACK_HEIGHT / 2 + 8;
                const x2 = toEvent.startDayIdx * DAY_WIDTH + 4;
                const y2 = toEvent.trackIndex * TRACK_HEIGHT + TRACK_HEIGHT / 2 + 8;

                const pathD = getBezierPath(x1, y1, x2, y2);

                return (
                  <g key={idx}>
                    {/* Path glow backdrop */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={conn.color}
                      strokeWidth="3.5"
                      strokeOpacity="0.15"
                    />
                    {/* Solid dashed connector path */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={conn.color}
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                    {/* Source dot */}
                    <circle cx={x1} cy={y1} r="3" fill={conn.color} />
                    {/* Target dot */}
                    <circle cx={x2} cy={y2} r="3" fill={conn.color} />
                  </g>
                );
              })}
            </svg>

            {/* Active day solid vertical line indicator stretching down */}
            <div
              className="absolute top-0 bottom-0 border-l-2 border-indigo-500/40 z-20 pointer-events-none transition-all duration-300"
              style={{ left: `${activeDayIndex * DAY_WIDTH + 24}px` }}
            />

            {/* Event Cards */}
            <div className="absolute inset-0 pt-4">
              {timelineEvents.events.map((event) => {
                const top = event.trackIndex * TRACK_HEIGHT + 6;
                const left = event.startDayIdx * DAY_WIDTH + 6;
                const width = (event.endDayIdx - event.startDayIdx + 1) * DAY_WIDTH - 12;
                const height = TRACK_HEIGHT - 12;

                let cardClass = "";
                let subtitleColorClass = "";
                let indicatorColorClass = "";
                const isGradient = event.color === "yellow";

                if (isGradient) {
                  // Beautiful purple-to-yellow sunset gradient matching ref.jpg style center card
                  cardClass = "bg-gradient-to-r from-[#4f46e5] via-[#a855f7] to-[#facc15] text-white border border-[#c084fc]/35 hover:opacity-95 shadow-md shadow-[#a855f7]/10 duration-200";
                  subtitleColorClass = "text-white/80";
                } else if (event.id.startsWith("deadline-") || event.color === "blue") {
                  cardClass = "bg-[#121212] border border-zinc-800 text-white hover:bg-zinc-900 shadow-md duration-200";
                  subtitleColorClass = "text-zinc-400";
                  indicatorColorClass = "bg-[#3b82f6]";
                } else {
                  cardClass = "bg-white border border-[#EFECE6] text-zinc-950 hover:bg-zinc-50 shadow-sm duration-200";
                  subtitleColorClass = "text-zinc-500 font-semibold";
                  
                  // Vary colors dynamically based on event info
                  const hash = event.id.charCodeAt(0) || 0;
                  indicatorColorClass = hash % 2 === 0 ? "bg-[#10b981]" : "bg-[#f97316]";
                }

                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`absolute rounded-[16px] px-3.5 py-1.5 flex items-center justify-between cursor-pointer select-none transition-all hover:scale-[1.015] hover:shadow-md group text-left min-w-0 z-20 ${cardClass}`}
                    style={{
                      left: `${left}px`,
                      width: `${width}px`,
                      top: `${top}px`,
                      height: `${height}px`,
                    }}
                  >
                    {/* Left details + pill indicator */}
                    <div className="flex items-center gap-4.5 min-w-0 flex-1 h-full">
                      {/* Accent vertical pill inside card */}
                      {!isGradient && (
                        <div className={`w-1 rounded-full shrink-0 ${indicatorColorClass}`} style={{ height: "20px" }} />
                      )}

                      {/* Sparkle/indicator arrow for special gradient card */}
                      {isGradient && (
                        <div className="text-white/90 shrink-0 text-[11px] font-black mr-0.5 animate-pulse">
                          ✦
                        </div>
                      )}

                      <div className="flex flex-col justify-center min-w-0 leading-tight">
                        <span className="text-[12.5px] font-bold tracking-tight truncate pr-2" title={event.title}>
                          {event.title}
                        </span>
                        <span className={`text-[10px] tracking-tight truncate mt-0.75 ${subtitleColorClass}`}>
                          {event.subtitle || event.tag?.text || "LMS Subject"}
                        </span>
                      </div>
                    </div>

                    <button 
                      className={`p-1 rounded-full transition-colors cursor-pointer shrink-0 ${
                        isGradient
                          ? "text-white/80 hover:bg-white/10"
                          : event.color === "blue" || event.id.startsWith("deadline-")
                            ? "text-zinc-400 hover:bg-zinc-800"
                            : "text-zinc-400 hover:bg-zinc-100"
                      }`}
                      title="Options"
                      onClick={(e) => {
                        e.stopPropagation(); // prevent modal opening
                      }}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
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

