"use client";

import React, { useState, useEffect } from "react";
import { X, Trash2, Calendar, Clock, MapPin, Users } from "lucide-react";
import { useLms } from "../../context/LmsContext";
import { LmsEvent } from "../../types/lms.interface";

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

  const isOpen = showAddModal || !!selectedEvent;

  useEffect(() => {
    setDayIndex(activeDayIndex);
  }, [activeDayIndex, showAddModal]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
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
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-zinc-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer"
    >
      <div className="bg-[#FAF7F2] w-full max-w-[480px] rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-300 relative cursor-default">
        
        {/* Floating Close Button for Detail View (Overlays banner) */}
        {selectedEvent && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-50 w-8.5 h-8.5 rounded-full flex items-center justify-center bg-black/35 hover:bg-black/50 text-white border border-white/10 backdrop-blur-md shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Close Details"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        )}

        {/* Header for Form View */}
        {!selectedEvent && (
          <div className="flex items-center justify-between p-6 border-b border-[#E5E1D8]/60 bg-white/40 shrink-0">
            <h2 className="text-lg font-black text-[#121212] tracking-tight">
              Create New Event
            </h2>
            <button
              onClick={handleClose}
              className="w-8.5 h-8.5 rounded-full hover:bg-zinc-200/50 text-zinc-500 hover:text-zinc-800 transition-all flex items-center justify-center border border-[#E5E1D8]/50 bg-white cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        )}

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {selectedEvent ? (
            <div className="flex flex-col text-[#121212]">
              
              {/* Cover Banner Header */}
              <div className="relative h-[210px] w-full shrink-0 overflow-hidden bg-gradient-to-tr from-[#121212] via-[#2a2927] to-[#d97706] flex flex-col justify-end p-6 select-none">
                {selectedEvent.image ? (
                  <>
                    <img
                      src={selectedEvent.image}
                      alt={selectedEvent.title}
                      className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/30 to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#121212] via-[#232220] to-[#d97706] opacity-95" />
                )}
                
                {/* Overlay Metadata */}
                <div className="relative z-10 flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="bg-[#facc15]/20 text-[#facc15] text-[10px] font-medium px-2.5 py-0.5 rounded-full">
                      {selectedEvent.tag?.text || "Academic Event"}
                    </span>
                    {selectedEvent.status === "in-progress" && (
                      <span className="bg-red-500/20 text-red-400 text-[10px] font-medium px-2.5 py-0.5 rounded-full animate-pulse">
                        Live
                      </span>
                    )}
                  </div>
                  <h3 className="text-[22px] font-black text-white tracking-tight leading-tight select-text">
                    {selectedEvent.title}
                  </h3>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="p-6 flex flex-col gap-6">
                
                {/* Event Schedule Info Rows (Flat layout, no subcards) */}
                <div className="flex flex-col gap-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] text-zinc-400 font-medium">Day</span>
                      <span className="text-[12.5px] font-semibold text-zinc-850">{DAYS_OF_WEEK[selectedEvent.dayIndex]}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] text-zinc-400 font-medium">Time Slot</span>
                      <span className="text-[12.5px] font-semibold text-zinc-850">{selectedEvent.timeStart} - {selectedEvent.timeEnd}</span>
                    </div>
                  </div>

                  {selectedEvent.subtitle && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-500/10 flex items-center justify-center text-zinc-500 shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col text-left min-w-0">
                        <span className="text-[10px] text-zinc-400 font-medium">Location</span>
                        <span className="text-[12.5px] font-semibold text-zinc-855 leading-tight truncate">{selectedEvent.subtitle}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description (Borderless flat details) */}
                {selectedEvent.description && (
                  <div className="flex flex-col gap-2 text-left">
                    <span className="text-[10px] font-bold text-zinc-400">
                      Overview & Details
                    </span>
                    <p className="text-[12.5px] text-zinc-655 leading-relaxed font-semibold select-text">
                      {selectedEvent.description}
                    </p>
                  </div>
                )}

                {/* Participants */}
                {selectedEvent.participants && (
                  <div className="flex flex-col gap-2 text-left select-none">
                    <span className="text-[10px] font-bold text-zinc-400">
                      Attendees ({selectedEvent.participants.count})
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2.5 overflow-hidden">
                        {selectedEvent.participants.initials.map((init, i) => (
                          <div
                            key={i}
                            className="inline-flex items-center justify-center w-8.5 h-8.5 rounded-full text-[10px] font-black text-zinc-800 bg-[#fbf9f6] border-2 border-white shadow-xs"
                          >
                            {init}
                          </div>
                        ))}
                        {selectedEvent.participants.count > selectedEvent.participants.initials.length && (
                          <div className="inline-flex items-center justify-center w-8.5 h-8.5 rounded-full text-[10px] font-black text-white bg-gradient-to-br from-[#facc15] to-[#d97706] border-2 border-white shadow-xs">
                            +{selectedEvent.participants.count - selectedEvent.participants.initials.length}
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-500 font-extrabold">
                        Enrolled in this group session
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions Footer */}
                <div className="flex items-center justify-between border-t border-[#E5E1D8]/60 pt-5 mt-2 gap-4">
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-red-500 hover:text-red-655 hover:bg-red-55/10 rounded-2xl text-[12px] font-black transition-all cursor-pointer border border-transparent"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Event</span>
                  </button>
                  
                  <button 
                    onClick={handleClose}
                    className="px-6 py-2.5 bg-[#121212] hover:bg-zinc-800 text-white rounded-full text-[12px] font-black shadow-md hover:shadow-lg active:scale-98 transition-all cursor-pointer shrink-0"
                  >
                    {selectedEvent.status !== "normal" ? "Join Session" : "Close Details"}
                  </button>
                </div>

              </div>

            </div>
          ) : (
            // Create New Event form...
            <div className="p-6">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Calculus I, Computer Networks"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#E5E1D8] bg-white outline-none text-[#121212] text-[13px] font-bold focus:border-zinc-500 shadow-2xs"
                  />
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                    Room / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. West camp, Room 312"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#E5E1D8] bg-white outline-none text-[#121212] text-[13px] font-bold focus:border-zinc-500 shadow-2xs"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 text-left">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                      Day
                    </label>
                    <select
                      value={dayIndex}
                      onChange={(e) => setDayIndex(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-2xl border border-[#E5E1D8] bg-white outline-none text-[#121212] text-[13px] font-bold focus:border-zinc-500 shadow-2xs"
                    >
                      {DAYS_OF_WEEK.map((d, idx) => (
                        <option key={d} value={idx}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                      Starts
                    </label>
                    <select
                      value={timeStart}
                      onChange={(e) => setTimeStart(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-2xl border border-[#E5E1D8] bg-white outline-none text-[#121212] text-[13px] font-bold focus:border-zinc-500 shadow-2xs"
                    >
                      {TIME_OPTIONS.slice(0, -4).map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                      Duration
                    </label>
                    <select
                      value={durationMins}
                      onChange={(e) => setDurationMins(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-2xl border border-[#E5E1D8] bg-white outline-none text-[#121212] text-[13px] font-bold focus:border-zinc-500 shadow-2xs"
                    >
                      <option value={100}>100 min</option>
                      <option value={150}>150 min</option>
                      <option value={200}>200 min</option>
                      <option value={250}>250 min</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-left">
                  <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                    Card Style Color
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setColor(c.id as any)}
                        className={`flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all cursor-pointer ${
                          color === c.id ? "border-[#d97706] scale-[1.02] bg-[#FAF7F2]" : "border-[#E5E1D8] hover:border-zinc-455 bg-[#fbf9f6]/40"
                        } ${c.bg}`}
                      >
                        <span className="text-[10px] font-black text-zinc-800 leading-none">{c.label.split(" ")[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {color === "image-text" && (
                  <>
                    <div className="grid grid-cols-3 gap-2 text-left">
                      <div className="col-span-2 flex flex-col gap-1">
                        <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                          Tag Text
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Clinical immunology"
                          value={tagText}
                          onChange={(e) => setTagText(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-2xl border border-[#E5E1D8] bg-white outline-none text-[#121212] text-[13px] font-bold focus:border-zinc-500 shadow-2xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                          Tag Color
                        </label>
                        <select
                          value={tagType}
                          onChange={(e) => setTagType(e.target.value as any)}
                          className="w-full px-3 py-2.5 rounded-2xl border border-[#E5E1D8] bg-white outline-none text-[#121212] text-[13px] font-bold focus:border-zinc-500 shadow-2xs"
                        >
                          <option value="pink">Pink</option>
                          <option value="blue">Blue</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 text-left">
                      <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                        Image URL
                      </label>
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/..."
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl border border-[#E5E1D8] bg-white outline-none text-[#121212] text-[13px] font-bold focus:border-zinc-500 shadow-2xs"
                      />
                    </div>

                    <div className="flex flex-col gap-1 text-left">
                      <label className="text-[10px] font-bold text-zinc-400">
                        Description
                      </label>
                      <textarea
                        placeholder="Provide a summary for this topic..."
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl border border-[#E5E1D8] bg-white outline-none text-[#121212] text-[13px] font-bold focus:border-zinc-500 resize-none shadow-2xs"
                      />
                    </div>
                  </>
                )}

                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                    Interactive Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-2xl border border-[#E5E1D8] bg-white outline-none text-[#121212] text-[13px] font-bold focus:border-zinc-500 shadow-2xs"
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
                    className="px-6 py-2.5 bg-[#121212] hover:bg-zinc-900 text-white rounded-full text-[13px] font-bold shadow-md transition-colors cursor-pointer"
                  >
                    Create Event
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
