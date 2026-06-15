"use client";

import React, { useState } from "react";
import { BookOpen, HelpCircle, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 5;

interface ClassesLinkedSectionProps {
  linkedSubjects: any[];
  setLinkedSubjects: React.Dispatch<React.SetStateAction<any[]>>;
  setIsClassModalOpen: (val: boolean) => void;
  setClassSearchQuery: (val: string) => void;
  hexToRgba: (hex: string, opacity: number) => string;
  showToast: (msg: string, type: "success" | "error") => void;
}

export default function ClassesLinkedSection({
  linkedSubjects,
  setLinkedSubjects,
  setIsClassModalOpen,
  setClassSearchQuery,
  hexToRgba,
  showToast,
}: ClassesLinkedSectionProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(linkedSubjects.length / PAGE_SIZE));
  const paged = linkedSubjects.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div id="classes-linked" className="flex flex-col gap-8 w-full mb-16 pl-12 scroll-mt-24">
      <div className="flex flex-col">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <h3 className="text-[14.5px] font-bold text-[#121212] flex items-center gap-2">
              <BookOpen className="w-4.5 h-4.5 text-[#f25c88]" />
              Classes Linked
            </h3>
            <button
              type="button"
              onClick={() => showToast("Link academic subjects to make them accessible inside this institution's view.", "success")}
              className="w-5 h-5 rounded-full bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-400 hover:text-zinc-600 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 group/help relative"
            >
              <HelpCircle className="w-3 h-3" />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-zinc-950 text-white text-[9px] font-bold rounded-lg opacity-0 group-hover/help:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-md z-30 border border-zinc-800">
                Help &amp; Docs
              </span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setClassSearchQuery("");
              setIsClassModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4.5 py-2 rounded-full border border-zinc-200 bg-white hover:bg-[#FAF9F5] hover:border-zinc-400 text-[11px] font-bold text-zinc-700 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            Link Class
          </button>
        </div>
        <p className="text-[12px] text-zinc-400 font-medium -mt-1 pl-6">
          Manage academic courses and syllabus items associated with this institution&apos;s curriculum.
        </p>
      </div>

      <div className="w-full overflow-x-auto">
        {linkedSubjects.length === 0 ? (
          <div className="w-full h-32 flex items-center justify-center border border-dashed border-[#E5E1D8] rounded-2xl bg-white/40">
            <span className="text-[12px] text-zinc-400 font-semibold">No classes linked to this institution.</span>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider w-16">Icon</th>
                <th className="pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Class Name &amp; Room</th>
                <th className="pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Lecturer</th>
                <th className="pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Schedule Info</th>
                <th className="pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Students</th>
                <th className="pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Category</th>
                <th className="pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider w-16 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100/55">
              {paged.map((sub) => {
                const initials = sub.name
                  ? sub.name.split(" ").map((w: string) => w[0]).join("").substring(0, 2).toUpperCase()
                  : "?";

                let themeColor = "#ECE8E0";
                if (sub.color === "yellow") themeColor = "#FAD56B";
                else if (sub.color === "blue") themeColor = "#BFD3F7";
                else if (sub.color === "image-text") themeColor = "#121212";
                else if (sub.color && sub.color.startsWith("#")) themeColor = sub.color;

                const schedulesText = sub.schedules && sub.schedules.length > 0
                  ? `${sub.schedules[0].day} ${sub.schedules[0].startTime}-${sub.schedules[0].endTime}`
                  : "No Schedule Set";

                const lecturerName = sub.lecturers && sub.lecturers.length > 0
                  ? sub.lecturers[0].name
                  : "No Lecturer Assigned";

                const participantCount = sub.participants ? sub.participants.length : 18;

                return (
                  <tr key={sub.id} className="hover:bg-zinc-50/10 transition-colors">
                    <td className="py-3 pr-2">
                      {sub.thumbnail && sub.thumbnail.trim().length > 0 ? (
                        <img
                          src={sub.thumbnail}
                          alt={sub.name}
                          className="w-8.5 h-8.5 rounded-full object-cover border border-zinc-200/50"
                        />
                      ) : (
                        <div
                          className="flex items-center justify-center w-8.5 h-8.5 rounded-full text-[10.5px] font-black border"
                          style={{
                            backgroundColor: hexToRgba(themeColor, 0.08),
                            color: themeColor === "#121212" ? "#121212" : themeColor,
                            borderColor: hexToRgba(themeColor, 0.12)
                          }}
                        >
                          {initials}
                        </div>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-zinc-800">{sub.name}</span>
                        <span className="text-[10px] text-zinc-400 font-medium">{sub.room || "Online Classroom"}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-[12px] text-zinc-600 font-semibold">{lecturerName}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-[12px] text-zinc-500 font-medium">{schedulesText}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-[12px] text-zinc-600 font-bold bg-[#FAF9F5] px-2 py-0.5 border border-zinc-200/50 rounded-md">
                        {participantCount} Enrolled
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-[10px] bg-zinc-100/60 text-zinc-500 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {sub.category || "Lecture"}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setLinkedSubjects((prev) => prev.filter((s) => s.id !== sub.id))}
                        className="p-2 text-zinc-400 hover:text-rose-600 transition-colors duration-200 cursor-pointer inline-flex items-center justify-center active:scale-95"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
          <span className="text-[11px] text-zinc-400 font-semibold">
            {linkedSubjects.length} classes &middot; page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 disabled:opacity-30 transition-all active:scale-90 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-lg text-[11px] font-bold transition-all active:scale-90 cursor-pointer ${
                  p === page
                    ? "bg-[#121212] text-white"
                    : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 disabled:opacity-30 transition-all active:scale-90 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
