"use client";

import React from "react";
import { Calendar, Plus, Trash2 } from "lucide-react";

interface FormSchedule {
  day: string;
  startTime: string;
  endTime: string;
  room: string;
}

interface SchedulesSectionProps {
  subjectSchedules: FormSchedule[];
  setSubjectSchedules: React.Dispatch<React.SetStateAction<FormSchedule[]>>;
  subjectColor: string;
  handleScheduleChange: (index: number, field: keyof FormSchedule, value: string) => void;
  daysOfWeek: string[];
  errorFields: { [key: string]: string };
}

export default function SchedulesSection({
  subjectSchedules,
  setSubjectSchedules,
  subjectColor,
  handleScheduleChange,
  daysOfWeek,
  errorFields,
}: SchedulesSectionProps) {
  return (
    <div id="schedules" className="flex flex-col gap-6 w-full mb-16 pl-12 scroll-mt-24">
      <div className="flex flex-col">
        <div className="flex items-center justify-between w-full">
          <h3 className="text-[14.5px] font-bold text-[#121212] flex items-center gap-2">
            <Calendar className="w-4.5 h-4.5" style={{ color: subjectColor }} />
            Schedules
          </h3>
          <button
            type="button"
            onClick={() => setSubjectSchedules((prev) => [...prev, { day: "Monday", startTime: "09:00", endTime: "10:40", room: "" }])}
            className="flex items-center gap-1.5 px-4.5 py-2 rounded-full border border-zinc-200 bg-white hover:bg-[#FAF9F5] hover:border-zinc-400 text-[11px] font-bold text-zinc-700 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Time
          </button>
        </div>
        <p className="text-[12px] text-zinc-400 font-medium -mt-1 pl-6">
          Define weekly timetables and set custom room overrides for individual lectures.
        </p>
      </div>

      {errorFields.subjectSchedules && (
        <span className="text-[11px] text-red-500 font-bold">{errorFields.subjectSchedules}</span>
      )}

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-zinc-200">
              <th className="pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Day of Week</th>
              <th className="pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Start Time</th>
              <th className="pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">End Time</th>
              <th className="pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Classroom Location</th>
              <th className="pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider w-16 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100/55">
            {subjectSchedules.map((schedule, idx) => (
              <tr key={idx} className="hover:bg-zinc-50/10 transition-colors">
                <td className="py-3 pr-4 w-[200px]">
                  <select
                    value={schedule.day}
                    onChange={(e) => handleScheduleChange(idx, "day", e.target.value)}
                    className="w-full px-1 py-2 bg-transparent border-b border-zinc-200 focus:outline-none text-[13px] font-semibold transition-colors duration-200 cursor-pointer"
                    onFocus={(e) => {
                      e.target.style.borderColor = subjectColor;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "";
                    }}
                  >
                    {daysOfWeek.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </td>
                <td className="py-3 pr-4 w-[130px]">
                  <input
                    type="time"
                    value={schedule.startTime}
                    onChange={(e) => handleScheduleChange(idx, "startTime", e.target.value)}
                    className="w-full px-1 py-2 bg-transparent border-b border-zinc-200 focus:outline-none text-[13px] font-semibold transition-colors duration-200"
                    onFocus={(e) => {
                      e.target.style.borderColor = subjectColor;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "";
                    }}
                  />
                </td>
                <td className="py-3 pr-4 w-[130px]">
                  <input
                    type="time"
                    value={schedule.endTime}
                    onChange={(e) => handleScheduleChange(idx, "endTime", e.target.value)}
                    className="w-full px-1 py-2 bg-transparent border-b border-zinc-200 focus:outline-none text-[13px] font-semibold transition-colors duration-200"
                    onFocus={(e) => {
                      e.target.style.borderColor = subjectColor;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "";
                    }}
                  />
                </td>
                <td className="py-3 pr-4">
                  <input
                    type="text"
                    placeholder="Inherit default location"
                    value={schedule.room}
                    onChange={(e) => handleScheduleChange(idx, "room", e.target.value)}
                    className="w-full px-1 py-2 bg-transparent border-b border-zinc-200 focus:outline-none text-[13px] font-medium placeholder-zinc-400/50 transition-colors duration-200"
                    onFocus={(e) => {
                      e.target.style.borderColor = subjectColor;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "";
                    }}
                  />
                </td>
                <td className="py-3 text-right">
                  {subjectSchedules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setSubjectSchedules((prev) => prev.filter((_, i) => i !== idx))}
                      className="p-2 text-zinc-400 hover:text-rose-600 transition-colors duration-200 cursor-pointer inline-flex items-center justify-center active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
