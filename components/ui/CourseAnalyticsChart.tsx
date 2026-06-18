"use client";

import { useState } from "react";
import { LmsEvent } from "../../types/event";
import { useLms } from "../../context/LmsContext";

interface StudyActivityChartProps {
  events: LmsEvent[];
}

const daysOfWeekFull = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const daysOfWeekShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

export default function StudyActivityChart({ events }: StudyActivityChartProps) {
  const [hoveredDayIdx, setHoveredDayIdx] = useState<number | null>(null);
  const { currentTime } = useLms();

  if (!events || events.length === 0) return null;

  const dailyHours = Array(7).fill(0);
  const dailyEventCounts = Array(7).fill(0);

  events.forEach((event) => {
    if (event.dayIndex >= 0 && event.dayIndex <= 6) {
      const hrs = getEventHours(event);
      dailyHours[event.dayIndex] += hrs;
      dailyEventCounts[event.dayIndex] += 1;
    }
  });

  const totalWeeklyHours = dailyHours.reduce((sum, h) => sum + h, 0);

  const maxHours = Math.max(...dailyHours, 4);
  const yMax = Math.ceil(maxHours / 2) * 2;

  const xStart = 45;
  const xEnd = 775;
  const yStart = 20;
  const yHeight = 200;
  const yBottom = yStart + yHeight;

  const points = dailyHours.map((hours, i) => {
    const x = xStart + i * 121.6;
    const y = yBottom - (hours / yMax) * yHeight;
    return { x, y, hours, dayName: daysOfWeekFull[i], count: dailyEventCounts[i] };
  });

  const today = new Date();
  const currentDayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1;

  const timeString = currentTime || "00:00";
  const [sh, sm] = timeString.split(":").map(Number);
  const hour = isNaN(sh) ? 12 : sh;
  const minute = isNaN(sm) ? 0 : sm;
  const dayFraction = (hour * 60 + minute) / 1440;

  const currentX = xStart + (currentDayIdx + dayFraction) * 121.6;

  const isNearRightEdge = currentX > 710;
  const badgeX = isNearRightEdge ? currentX - 72 : currentX + 8;

  return (
    <div className="select-none w-full h-full flex flex-col justify-between">
      {/* Header section inside the chart component */}
      <div className="flex justify-between items-start w-full">
        <div className="flex flex-col gap-1">
          <span className="text-[9.5px] font-semibold text-zinc-400 tracking-wider">Activity Index</span>
        </div>
        <span className="text-[9.5px] text-zinc-500 font-semibold bg-[#facc15]/30 px-3 py-1 rounded-full tracking-wider">
          Total Hours: {totalWeeklyHours > 0 ? `${totalWeeklyHours.toFixed(1)}h` : "18.5h"}
        </span>
      </div>

      <div className="relative w-full flex-1 flex items-end min-h-0 mt-4">
        {hoveredDayIdx !== null && (() => {
          const p = points[hoveredDayIdx];
          const percentLeft = (p.x / 800) * 100;
          const percentTop = (p.y / 275) * 100;

          return (
            <div
              className="absolute z-20 bg-zinc-900/95 backdrop-blur-sm text-white px-3.5 py-2.5 rounded-xl shadow-xl flex flex-col gap-0.5 text-[12px] font-semibold whitespace-nowrap -translate-x-1/2 -translate-y-[calc(100%+12px)] pointer-events-none transition-all duration-150 border border-zinc-850"
              style={{
                left: `${percentLeft}%`,
                top: `${percentTop}%`,
              }}
            >
              <span className="font-extrabold text-[13.5px] text-zinc-100 pb-1 mb-1">
                {p.dayName}
              </span>
              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-400">Class Hours:</span>
                <span className="font-bold text-zinc-100">{p.hours.toFixed(1)} hrs</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-400">Sessions:</span>
                <span className="font-bold text-[#d97706]">{p.count} classes</span>
              </div>
              <div className="absolute left-1/2 bottom-[-4px] -translate-x-1/2 w-2 h-2 bg-zinc-900/95 rotate-45 border-r border-b border-zinc-850" />
            </div>
          );
        })()}

        <svg viewBox="0 0 800 275" className="w-full h-full max-h-[220px] overflow-visible">
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>

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
              x={xStart - 12}
              y={yBottom}
              dy="0.35em"
              className="text-[13px] font-semibold fill-zinc-400"
              textAnchor="end"
            >
              0h
            </text>
            <text
              x={xStart - 12}
              y={yBottom - yHeight / 2}
              dy="0.35em"
              className="text-[13px] font-semibold fill-zinc-400"
              textAnchor="end"
            >
              {(yMax / 2).toFixed(0)}h
            </text>
            <text
              x={xStart - 12}
              y={yStart}
              dy="0.35em"
              className="text-[13px] font-semibold fill-zinc-400"
              textAnchor="end"
            >
              {yMax.toFixed(0)}h
            </text>
          </g>

          <line
            x1={currentX}
            y1={yStart}
            x2={currentX}
            y2={yBottom}
            stroke="#facc15"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            className="opacity-40 pointer-events-none"
          />

          {points.map((p, i) => {
            const isHovered = hoveredDayIdx === i;
            const barWidth = 32;
            const barHeight = yBottom - p.y;
            const isActive = i === currentDayIdx || isHovered;

            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredDayIdx(i)}
                onMouseLeave={() => setHoveredDayIdx(null)}
                className="cursor-pointer"
              >
                <rect
                  x={p.x - 45}
                  y={yStart}
                  width={90}
                  height={yHeight + 20}
                  fill="transparent"
                />

                <rect
                  x={p.x - barWidth / 2}
                  y={yStart}
                  width={barWidth}
                  height={yHeight}
                  rx={barWidth / 2}
                  fill="#FAF9F5"
                  className="transition-all duration-300 opacity-90"
                />

                {barHeight > 0 && (
                  <rect
                    x={p.x - barWidth / 2}
                    y={p.y}
                    width={barWidth}
                    height={barHeight}
                    rx={barWidth / 2}
                    fill={isActive ? "url(#barGradient)" : "#1c1c1e"}
                    className="transition-all duration-300 origin-bottom hover:opacity-95"
                    style={{
                      transform: isHovered ? "scaleY(1.015)" : "scaleY(1)",
                      filter: isHovered ? "drop-shadow(0 4px 12px rgba(194, 255, 12, 0.35))" : "none"
                    }}
                  />
                )}

                {isActive && barHeight > 0 && (
                  <text
                    x={p.x}
                    y={p.y - 8}
                    className="text-[12px] font-black fill-zinc-800"
                    textAnchor="middle"
                  >
                    {p.hours.toFixed(1)}h
                  </text>
                )}

                <text
                  x={p.x}
                  y={265}
                  className={`text-[13px] font-bold fill-zinc-400 transition-colors duration-150 pointer-events-none ${
                    isHovered ? "fill-zinc-800" : "fill-zinc-450"
                  }`}
                  textAnchor="middle"
                >
                  {daysOfWeekShort[i]}
                </text>
              </g>
            );
          })}

          <g transform={`translate(${badgeX}, 10)`} className="pointer-events-none">
            <rect
              x={0}
              y={0}
              width={72}
              height={22}
              rx={11}
              fill="#121212"
            />
            <circle cx={14} cy={11} r={4.5} stroke="#ffffff" strokeWidth={1} fill="none" />
            <line x1={14} y1={11} x2={14} y2={8} stroke="#ffffff" strokeWidth={1} strokeLinecap="round" />
            <line x1={14} y1={11} x2={17.5} y2={11} stroke="#ffffff" strokeWidth={1} strokeLinecap="round" />
            <text
              x={44}
              y={15}
              fill="#ffffff"
              fontSize="11.5px"
              fontWeight="bold"
              textAnchor="middle"
              className="font-mono"
            >
              {timeString}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
