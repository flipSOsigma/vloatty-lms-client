"use client";

import React from "react";
import { useLms } from "../../context/LmsContext";
import { LmsEvent } from "../../types/lms";
import ScheduleCard from "../ui/ScheduleCard";

// Helper to get week number of a date
const getWeekNumber = (d: Date): number => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

// Helper to generate the 7 days of the current week (Mon-Sun)
const getWeekDates = (): { label: string; date: string; isPink?: boolean }[] => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday...
  const dayOffset = currentDay === 0 ? -6 : 1 - currentDay; // offset to Monday
  
  const monday = new Date(today);
  monday.setDate(today.getDate() + dayOffset);

  const labels = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  return Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const dateStr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    return {
      label: labels[idx],
      date: dateStr,
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
  "21:00",
];

const START_HOUR = 7;
const ROW_HEIGHT = 100; // height for 1 hour in px
const HOUR_HEIGHT = ROW_HEIGHT;
const MINUTE_HEIGHT = HOUR_HEIGHT / 60; // 1.667px per minute

// Helper to convert "HH:MM" to minutes from 07:00
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

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const DAYS = React.useMemo(() => {
    if (!mounted) {
      return [
        { label: "MON", date: "11/05" },
        { label: "TUE", date: "12/05" },
        { label: "WED", date: "13/05" },
        { label: "THU", date: "14/05" },
        { label: "FRI", date: "15/05" },
        { label: "SAT", date: "16/05" },
        { label: "SUN", date: "17/05", isPink: true },
      ];
    }
    return getWeekDates();
  }, [mounted]);

  const currentWeekNumber = React.useMemo(() => {
    if (!mounted) return 24;
    return getWeekNumber(new Date());
  }, [mounted]);

  // Filter events based on search query and category tags
  const filteredEvents = events.filter((event) => {
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

  const curMins = getMinutesFromStart(currentTime);
  const timeLineTop = curMins * MINUTE_HEIGHT;

  return (
    <div className="flex flex-col flex-1 bg-[#FAF7F2] p-6 rounded-3xl overflow-y-auto select-none border border-[#EFECE6] relative max-h-[calc(100vh-180px)]">
      {/* Week Day Headers */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] w-full border-b border-[#E5E1D8]/60 pb-4 mb-4">
        <div className="flex items-center justify-center text-[11px] font-bold text-zinc-400">
          {"W" + currentWeekNumber}
        </div>
        
        {DAYS.map((day, idx) => {
          const isActive = idx === activeDayIndex;
          return (
            <div
              key={day.label}
              onClick={() => setActiveDayIndex(idx)}
              className="flex justify-center items-center cursor-pointer"
            >
              {isActive ? (
                <div className="flex flex-col items-center justify-center bg-[#121212] text-white px-5 py-2.5 rounded-2xl shadow-md min-w-[75px] transition-all duration-300">
                  <span className="text-[10px] tracking-wider font-semibold opacity-70">
                    {day.label}
                  </span>
                  <span className="text-[15px] font-bold mt-0.5">{day.date}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-2 hover:bg-[#EFECE6]/50 rounded-xl transition-all w-full">
                  <span
                    className={`text-[10px] tracking-wider font-semibold ${
                      day.isPink ? "text-[#f25c88]" : "text-zinc-400"
                    }`}
                  >
                    {day.label}
                  </span>
                  <span
                    className={`text-[15px] font-bold mt-0.5 ${
                      day.isPink ? "text-[#f25c88]" : "text-zinc-800"
                    }`}
                  >
                    {day.date}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="relative flex flex-row w-full" style={{ height: `${(HOURS.length - 1) * ROW_HEIGHT}px` }}>
        
        {/* Hours Column */}
        <div className="w-[60px] flex flex-col justify-between text-[11px] font-bold text-zinc-400 py-1 pr-4 relative">
          {HOURS.map((hour, idx) => (
            <div
              key={hour}
              className="absolute text-right w-full pr-4 select-none"
              style={{ top: `${idx * ROW_HEIGHT}px`, transform: "translateY(-50%)" }}
            >
              {hour}
            </div>
          ))}
        </div>

        {/* Calendar Grid Lines & Days Columns */}
        <div className="flex-1 grid grid-cols-7 relative h-full border-l border-[#E5E1D8]/40">
          
          {/* Horizontal Grid Lines */}
          {HOURS.map((hour, idx) => (
            <div
              key={`line-${hour}`}
              className="absolute left-0 right-0 border-t border-[#E5E1D8]/50 pointer-events-none"
              style={{ top: `${idx * ROW_HEIGHT}px` }}
            />
          ))}

          {/* Vertical Columns Lines */}
          {Array.from({ length: 7 }).map((_, idx) => (
            <div
              key={`col-${idx}`}
              className="absolute top-0 bottom-0 border-r border-[#E5E1D8]/20 pointer-events-none"
              style={{ left: `${(idx + 1) * 14.285}%` }}
            />
          ))}

          {/* Current Time Line Indicator */}
          {timeLineTop >= 0 && timeLineTop <= (HOURS.length - 1) * ROW_HEIGHT && (
            <div
              className="absolute left-0 right-0 border-t-2 border-dashed border-[#f25c88] z-20 flex items-center pointer-events-none transition-all duration-500"
              style={{ top: `${timeLineTop}px` }}
            >
              {/* Glowing Pulse Dot Indicator */}
              <div
                className="absolute w-2 h-2 bg-[#f25c88] rounded-full z-30 transition-all duration-500"
                style={{ left: "0px", transform: "translate(-50%, -50%)" }}
              >
                <div className="absolute w-full h-full bg-[#f25c88] rounded-full animate-ping opacity-75" />
              </div>

              {/* Time display bubble */}
              <div
                className="absolute bg-[#f25c88] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-30 transition-all duration-500"
                style={{ left: "-60px", transform: "translateY(-50%)" }}
              >
                {currentTime}
              </div>
            </div>
          )}

          {/* Events placement */}
          {filteredEvents.map((event) => {
            const startMins = getMinutesFromStart(event.timeStart);
            const endMins = getMinutesFromStart(event.timeEnd);
            const duration = endMins - startMins;

            const top = startMins * MINUTE_HEIGHT;
            const height = duration * MINUTE_HEIGHT;
            const leftPercent = event.dayIndex * 14.285 + 0.5;
            const widthPercent = 14.285 - 1.0;

            const subject = subjects.find((s) => s.id === event.subjectId);
            const lecturerName = subject ? subject.lecturers.map((l) => l.name).join(", ") : undefined;

            return (
              <ScheduleCard
                key={event.id}
                event={event}
                lecturerName={lecturerName}
                onClick={() => setSelectedEvent(event)}
                style={{
                  top: `${top}px`,
                  height: `${height}px`,
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`,
                  zIndex: event.color === "image-text" ? 10 : 5,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
