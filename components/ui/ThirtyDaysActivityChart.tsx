"use client";

import { useState } from "react";
import { LmsEvent } from "../../types/lms";
import { useLms } from "../../context/LmsContext";

interface ThirtyDaysActivityChartProps {
  events: LmsEvent[];
}

const getEventHours = (event: LmsEvent) => {
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

export default function ThirtyDaysActivityChart({ events }: ThirtyDaysActivityChartProps) {
  const [hoveredDayIdx, setHoveredDayIdx] = useState<number | null>(null);
  const { currentTime } = useLms();

  // Generate the last 30 dates (from oldest to newest: today - 29 days to today)
  const last30Days = Array.from({ length: 30 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - idx));
    return d;
  });

  const dailyHours = Array(30).fill(0);
  const dailyEventCounts = Array(30).fill(0);

  // Map events to their respective days in the last 30 days
  events.forEach((event) => {
    if (!event.dateStr) return;
    const eventDate = new Date(event.dateStr);
    if (isNaN(eventDate.getTime())) return;

    const eventDateKey = eventDate.toDateString();
    last30Days.forEach((d, idx) => {
      if (d.toDateString() === eventDateKey) {
        const hrs = getEventHours(event);
        dailyHours[idx] += hrs;
        dailyEventCounts[idx] += 1;
      }
    });
  });

  const totalWeeklyHours = dailyHours.reduce((sum, h) => sum + h, 0);
  const maxHours = Math.max(...dailyHours, 4);
  const yMax = Math.ceil(maxHours / 2) * 2;

  const xStart = 52;
  const xEnd = 775;
  const yStart = 42;
  const yHeight = 168;
  const yBottom = yStart + yHeight;

  const colWidth = (xEnd - xStart) / 29;

  const points = dailyHours.map((hours, i) => {
    const x = xStart + i * colWidth;
    const y = yBottom - (hours / yMax) * yHeight;
    return {
      x,
      y,
      hours,
      dateObj: last30Days[i],
      dateLabel: last30Days[i].toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: dailyEventCounts[i]
    };
  });

  const todayStr = new Date().toDateString();
  const currentDayIdx = last30Days.findIndex((d) => d.toDateString() === todayStr);

  return (
    <div className="select-none w-full h-full flex flex-col justify-between">
      {/* Header Section */}
      <div className="flex justify-between items-start w-full">
        <div className="flex flex-col gap-1">
          <span className="text-[9.5px] font-semibold text-zinc-400 tracking-wider">Activity Index (30 Days)</span>
        </div>
        <span className="text-[9.5px] text-zinc-500 font-semibold bg-[#facc15]/30 px-3 py-1 rounded-full tracking-wider">
          Total: {totalWeeklyHours > 0 ? `${totalWeeklyHours.toFixed(1)}h` : "0.0h"}
        </span>
      </div>

      <div className="relative w-full flex-1 flex items-end min-h-0 mt-6">
        {/* Tooltip */}
        {hoveredDayIdx !== null && (() => {
          const p = points[hoveredDayIdx];
          const percentLeft = (p.x / 800) * 100;
          const percentTop = (p.y / 275) * 100;

          return (
            <div
              className="absolute z-20 bg-zinc-900/95 backdrop-blur-sm text-white px-3.5 py-2.5 rounded-xl shadow-xl flex flex-col gap-0.5 text-[11px] font-semibold whitespace-nowrap -translate-x-1/2 -translate-y-[calc(100%+12px)] pointer-events-none transition-all duration-150 border border-zinc-800"
              style={{
                left: `${percentLeft}%`,
                top: `${percentTop}%`,
              }}
            >
              <span className="font-extrabold text-[12px] text-zinc-100 pb-1 mb-1 border-b border-zinc-800">
                {p.dateObj.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </span>
              <div className="flex items-center justify-between gap-4 mt-0.5">
                <span className="text-zinc-400">Class Hours:</span>
                <span className="font-bold text-zinc-100">{p.hours.toFixed(1)} hrs</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-400">Sessions:</span>
                <span className="font-bold text-[#facc15]">{p.count} classes</span>
              </div>
              <div className="absolute left-1/2 bottom-[-4px] -translate-x-1/2 w-2 h-2 bg-zinc-900/95 rotate-45 border-r border-b border-zinc-800" />
            </div>
          );
        })()}

        <svg viewBox="0 0 800 275" className="w-full h-full max-h-[220px] overflow-visible">
          <defs>
            <linearGradient id="thirtyBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={xStart}
            y1={yBottom - yHeight / 2}
            x2={xEnd}
            y2={yBottom - yHeight / 2}
            stroke="#E5E1D8"
            strokeWidth={1}
            strokeDasharray="4 4"
            className="opacity-100"
          />
          <line
            x1={xStart}
            y1={yStart}
            x2={xEnd}
            y2={yStart}
            stroke="#E5E1D8"
            strokeWidth={1}
            strokeDasharray="4 4"
            className="opacity-40"
          />

          {/* Y Axis line and texts */}
          <g className="pointer-events-none select-none">
            <line
              x1={xStart}
              y1={yStart}
              x2={xStart}
              y2={yBottom}
              stroke="#E5E1D8"
              strokeWidth={1.5}
            />
            <text
              x={xStart - 18}
              y={yBottom}
              dy="0.35em"
              className="text-[13px] font-semibold fill-zinc-400"
              textAnchor="end"
            >
              0h
            </text>
            <text
              x={xStart - 18}
              y={yBottom - yHeight / 2}
              dy="0.35em"
              className="text-[13px] font-semibold fill-zinc-400"
              textAnchor="end"
            >
              {(yMax / 2).toFixed(0)}h
            </text>
            <text
              x={xStart - 18}
              y={yStart}
              dy="0.35em"
              className="text-[13px] font-semibold fill-zinc-400"
              textAnchor="end"
            >
              {yMax.toFixed(0)}h
            </text>
          </g>

          {/* Render 30 Bars */}
          {points.map((p, i) => {
            const isHovered = hoveredDayIdx === i;
            const barWidth = 14;
            const barHeight = yBottom - p.y;
            const isActive = i === currentDayIdx || isHovered;

            // Draw axis labels for index 0, 10, 20, 29
            const showLabel = i === 0 || i === 10 || i === 20 || i === 29;

            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredDayIdx(i)}
                onMouseLeave={() => setHoveredDayIdx(null)}
                className="cursor-pointer"
              >
                {/* Transparent hover zone wrapper */}
                <rect
                  x={p.x - colWidth / 2}
                  y={yStart}
                  width={colWidth}
                  height={yHeight + 20}
                  fill="transparent"
                />

                {/* Back track */}
                <rect
                  x={p.x - barWidth / 2}
                  y={yStart}
                  width={barWidth}
                  height={yHeight}
                  rx={barWidth / 2}
                  fill="#FAF9F5"
                  className="transition-all duration-300 opacity-90"
                />

                {/* Active bar */}
                {barHeight > 0 && (
                  <rect
                    x={p.x - barWidth / 2}
                    y={p.y}
                    width={barWidth}
                    height={barHeight}
                    rx={barWidth / 2}
                    fill={isActive ? "url(#thirtyBarGradient)" : "#1c1c1e"}
                    className="transition-all duration-300 origin-bottom hover:opacity-95"
                    style={{
                      transform: isHovered ? "scaleY(1.015)" : "scaleY(1)",
                      filter: isHovered ? "drop-shadow(0 4px 12px rgba(250, 204, 21, 0.35))" : "none"
                    }}
                  />
                )}

                {/* Active bar hour text */}
                {isActive && barHeight > 0 && (
                  <text
                    x={p.x}
                    y={p.y - 12}
                    className="text-[11px] font-black fill-zinc-800"
                    textAnchor="middle"
                  >
                    {p.hours.toFixed(1)}h
                  </text>
                )}

                {/* X Axis label */}
                {showLabel && (
                  <text
                    x={p.x}
                    y={265}
                    className={`text-[12px] font-bold transition-colors duration-150 pointer-events-none ${
                      isHovered ? "fill-zinc-800" : "fill-zinc-400"
                    }`}
                    textAnchor="middle"
                  >
                    {p.dateLabel}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
