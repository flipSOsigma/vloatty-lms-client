"use client";

import React from "react";
import { Search, X, Plus } from "lucide-react";

interface LecturerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  lecturerSearchQuery: string;
  setLecturerSearchQuery: (val: string) => void;
  filteredSuggestions: any[];
  onSelectLecturer: (lecturer: { name: string; email: string }) => void;
}

export default function LecturerSearchModal({
  isOpen,
  onClose,
  lecturerSearchQuery,
  setLecturerSearchQuery,
  filteredSuggestions,
  onSelectLecturer,
}: LecturerSearchModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#E5E1D8] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-extrabold text-[#121212] tracking-tight">Add Lecturer</h3>
            <p className="text-[11px] text-zinc-400 font-medium">Search faculty members by name or email</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 border-b border-zinc-100 bg-zinc-50/30">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={lecturerSearchQuery}
              onChange={(e) => setLecturerSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-zinc-200 bg-white text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[#f25c88]/20 focus:border-[#f25c88] transition-all"
              autoFocus
            />
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 min-h-[220px] max-h-[380px] flex flex-col gap-1.5 no-scrollbar">
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((faculty) => {
              const initials = faculty.name
                ? faculty.name
                    .split(" ")
                    .map((w: string) => w[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()
                : "?";
              return (
                <button
                  key={faculty.email}
                  type="button"
                  onClick={() => onSelectLecturer(faculty)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-zinc-50 text-left transition-all group active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#f25c88]/10 border border-[#f25c88]/15 text-[#f25c88] text-[11px] font-black group-hover:bg-[#f25c88]/20 transition-colors">
                    {initials}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[13px] font-bold text-zinc-800 group-hover:text-[#121212] truncate">
                      {faculty.name}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-medium truncate">
                      {faculty.email}
                    </span>
                  </div>
                  <Plus className="w-4 h-4 text-zinc-300 group-hover:text-[#f25c88] transition-colors mr-1" />
                </button>
              );
            })
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center px-4">
              <Search className="w-8 h-8 text-zinc-300 mb-2" />
              <span className="text-[12.5px] font-bold text-zinc-600">No suggestions found</span>
              <p className="text-[11px] text-zinc-400 mt-1 max-w-[240px] font-medium">
                No faculty matches &quot;{lecturerSearchQuery}&quot;.
              </p>
              {lecturerSearchQuery.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const query = lecturerSearchQuery.trim();
                    let email = "";
                    let name = "";
                    if (query.includes("@")) {
                      email = query;
                      const partBeforeAt = query.split("@")[0];
                      name = partBeforeAt
                        .split(".")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ");
                    } else {
                      name = query;
                      email = `${query.toLowerCase().replace(/\s+/g, ".")}@vloatty.edu`;
                    }
                    onSelectLecturer({ name, email });
                  }}
                  className="mt-4 px-4 py-2 border border-dashed border-[#f25c88]/40 hover:border-[#f25c88] text-[#f25c88] rounded-full text-[11px] font-bold bg-[#f25c88]/5 hover:bg-[#f25c88]/10 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add &quot;{lecturerSearchQuery.trim()}&quot; custom
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
