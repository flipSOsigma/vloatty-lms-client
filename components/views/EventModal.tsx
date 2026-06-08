"use client";

import React, { useState, useEffect } from "react";
import { X, Trash2, Calendar, Clock, MapPin, Users } from "lucide-react";
import { useLms } from "../../context/LmsContext";
import { LmsEvent } from "../../types/lms";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const COLORS = [
  { id: "cream", label: "Beige/Cream", bg: "bg-[#ECE8E0]" },
  { id: "yellow", label: "Yellow (Group)", bg: "bg-[#FAD56B]" },
  { id: "blue", label: "Blue (Interns)", bg: "bg-[#BFD3F7]" },
  { id: "image-text", label: "Image Card", bg: "bg-[#F3F0EA]" },
];

const TIME_OPTIONS = Array.from({ length: 29 }).map((_, i) => {
  const h = Math.floor(i / 2) + 7;
  const m = (i % 2) * 30;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
});

export default function EventModal() {
  const {
    showAddModal,
    setShowAddModal,
    selectedEvent,
    setSelectedEvent,
    addEvent,
    deleteEvent,
    activeDayIndex,
  } = useLms();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [timeStart, setTimeStart] = useState("08:00");
  const [durationMins, setDurationMins] = useState(100);
  const [dayIndex, setDayIndex] = useState(activeDayIndex);
  const [color, setColor] = useState<"cream" | "yellow" | "blue" | "image-text">("cream");
  const [tagText, setTagText] = useState("");
  const [tagType, setTagType] = useState<"pink" | "blue">("pink");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState<"normal" | "joinable" | "in-progress">("normal");

  useEffect(() => {
    setDayIndex(activeDayIndex);
  }, [activeDayIndex, showAddModal]);

  if (!showAddModal && !selectedEvent) return null;

  const handleClose = () => {
    setShowAddModal(false);
    setSelectedEvent(null);
    setTitle("");
    setSubtitle("");
    setTimeStart("08:00");
    setDurationMins(100);
    setColor("cream");
    setTagText("");
    setDescription("");
    setImageUrl("");
    setStatus("normal");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Calculate end time: start time + duration minutes
    const [h, m] = timeStart.split(":").map(Number);
    const totalMins = h * 60 + m + durationMins;
    const endH = Math.floor(totalMins / 60);
    const endM = totalMins % 60;
    const computedTimeEnd = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

    addEvent({
      title,
      subtitle: subtitle || undefined,
      timeStart,
      timeEnd: computedTimeEnd,
      dayIndex,
      color,
      tag: tagText ? { text: tagText, type: tagType } : undefined,
      description: description || undefined,
      image: imageUrl || undefined,
      status,
      participants:
        color === "yellow" || color === "blue"
          ? { initials: ["TY", "AB"], count: 4 }
          : undefined,
    });

    handleClose();
  };

  const handleDelete = () => {
    if (selectedEvent) {
      deleteEvent(selectedEvent.id);
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#FAF7F2] border border-[#E5E1D8] w-full max-w-[500px] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-[#E5E1D8]/60 bg-white/40">
          <h2 className="text-xl font-bold text-[#121212]">
            {selectedEvent ? "Event Details" : "Create New Event"}
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-zinc-200/50 text-zinc-500 hover:text-zinc-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {selectedEvent ? (
            <div className="flex flex-col gap-6 text-[#121212]">
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-3 py-1 text-[11px] font-bold rounded-full ${
                      selectedEvent.color === "yellow"
                        ? "bg-amber-100 text-amber-800"
                        : selectedEvent.color === "blue"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-zinc-200 text-zinc-800"
                    }`}
                  >
                    {selectedEvent.title}
                  </span>
                  {selectedEvent.tag && (
                    <span
                      className={`px-3 py-1 text-[11px] font-bold rounded-full ${
                        selectedEvent.tag.type === "pink"
                          ? "bg-[#f25c88]/15 text-[#f25c88]"
                          : "bg-blue-500/15 text-blue-600"
                      }`}
                    >
                      {selectedEvent.tag.text}
                    </span>
                  )}
                  {selectedEvent.status === "in-progress" && (
                    <span className="bg-[#f25c88] text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                      In progress..
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-extrabold tracking-tight mt-1">
                  {selectedEvent.title}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-white/50 border border-[#E5E1D8]/40 p-4 rounded-2xl">
                <div className="flex items-center gap-2 text-zinc-600 text-[13px] font-semibold">
                  <Calendar className="w-4 h-4 text-[#f25c88]" />
                  <span>{DAYS_OF_WEEK[selectedEvent.dayIndex]}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-600 text-[13px] font-semibold">
                  <Clock className="w-4 h-4 text-[#f25c88]" />
                  <span>
                    {selectedEvent.timeStart} - {selectedEvent.timeEnd}
                  </span>
                </div>
                {selectedEvent.subtitle && (
                  <div className="flex items-center gap-2 text-zinc-600 text-[13px] font-semibold col-span-2 border-t border-zinc-200/40 pt-2 mt-1">
                    <MapPin className="w-4 h-4 text-zinc-400" />
                    <span>{selectedEvent.subtitle}</span>
                  </div>
                )}
              </div>

              {selectedEvent.image && (
                <div className="w-full h-[180px] rounded-2xl overflow-hidden bg-zinc-200 border border-zinc-300/30">
                  <img
                    src={selectedEvent.image}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover grayscale-[10%]"
                  />
                </div>
              )}

              {selectedEvent.description && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Description
                  </span>
                  <p className="text-[13px] text-zinc-600 leading-relaxed font-medium bg-white/40 border border-[#E5E1D8]/20 p-3.5 rounded-2xl">
                    {selectedEvent.description}
                  </p>
                </div>
              )}

              {selectedEvent.participants && (
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Participants ({selectedEvent.participants.count})
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2.5 overflow-hidden">
                      {selectedEvent.participants.initials.map((init, i) => (
                        <div
                          key={i}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full text-[11px] font-bold text-zinc-800 bg-white border-2 border-[#FAF7F2] shadow-sm"
                        >
                          {init}
                        </div>
                      ))}
                      {selectedEvent.participants.count > selectedEvent.participants.initials.length && (
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full text-[11px] font-bold text-white bg-blue-500 border-2 border-[#FAF7F2] shadow-sm">
                          +{selectedEvent.participants.count - selectedEvent.participants.initials.length}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-[#E5E1D8]/60 pt-4 mt-2">
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl text-[13px] font-bold transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete event</span>
                </button>
                {selectedEvent.status !== "normal" && (
                  <button className="px-6 py-2.5 bg-[#121212] hover:bg-zinc-800 text-white rounded-full text-[13px] font-bold shadow-md transition-colors cursor-pointer">
                    Join Session
                  </button>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Calculus I, Computer Networks"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E1D8] bg-white outline-none text-[#121212] text-[13px] font-semibold focus:border-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Room / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. West camp, Room 312"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E1D8] bg-white outline-none text-[#121212] text-[13px] font-semibold focus:border-zinc-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Day
                  </label>
                  <select
                    value={dayIndex}
                    onChange={(e) => setDayIndex(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E1D8] bg-white outline-none text-[#121212] text-[13px] font-semibold focus:border-zinc-500"
                  >
                    {DAYS_OF_WEEK.map((d, idx) => (
                      <option key={d} value={idx}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Starts
                  </label>
                  <select
                    value={timeStart}
                    onChange={(e) => setTimeStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E1D8] bg-white outline-none text-[#121212] text-[13px] font-semibold focus:border-zinc-500"
                  >
                    {TIME_OPTIONS.slice(0, -4).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Duration
                  </label>
                  <select
                    value={durationMins}
                    onChange={(e) => setDurationMins(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E1D8] bg-white outline-none text-[#121212] text-[13px] font-semibold focus:border-zinc-500"
                  >
                    <option value={100}>100 min</option>
                    <option value={150}>150 min</option>
                    <option value={200}>200 min</option>
                    <option value={250}>250 min</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Card Style Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColor(c.id as any)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all cursor-pointer ${
                        color === c.id ? "border-[#f25c88] scale-[1.03]" : "border-[#E5E1D8] hover:border-zinc-400"
                      } ${c.bg}`}
                    >
                      <span className="text-[10px] font-bold text-zinc-800">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {color === "image-text" && (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2 flex flex-col gap-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Tag Text
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Clinical immunology"
                        value={tagText}
                        onChange={(e) => setTagText(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E5E1D8] bg-white outline-none text-[#121212] text-[13px] font-semibold focus:border-zinc-500"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Tag Color
                      </label>
                      <select
                        value={tagType}
                        onChange={(e) => setTagType(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#E5E1D8] bg-white outline-none text-[#121212] text-[13px] font-semibold focus:border-zinc-500"
                      >
                        <option value="pink">Pink</option>
                        <option value="blue">Blue</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Image URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5E1D8] bg-white outline-none text-[#121212] text-[13px] font-semibold focus:border-zinc-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Description
                    </label>
                    <textarea
                      placeholder="Provide a summary for this topic..."
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5E1D8] bg-white outline-none text-[#121212] text-[13px] font-semibold focus:border-zinc-500 resize-none"
                    />
                  </div>
                </>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Interactive Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E1D8] bg-white outline-none text-[#121212] text-[13px] font-semibold focus:border-zinc-500"
                >
                  <option value="normal">None (Static Card)</option>
                  <option value="joinable">Joinable (Has Join button)</option>
                  <option value="in-progress">In progress (Blinks, has Join button)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-[#E5E1D8]/60">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 border border-[#E5E1D8] text-zinc-700 hover:bg-zinc-100 rounded-full text-[13px] font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#121212] hover:bg-zinc-800 text-white rounded-full text-[13px] font-bold shadow-md transition-colors cursor-pointer"
                >
                  Create Event
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
