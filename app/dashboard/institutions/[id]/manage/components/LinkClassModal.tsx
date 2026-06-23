"use client";

import React from "react";
import { Search, X, Plus } from "lucide-react";

import { Subject } from "../../../../../../types/subject";

interface LinkClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classSearchQuery: string;
  setClassSearchQuery: (val: string) => void;
  availableSubjects: Subject[];
  onLinkClass: (sub: Subject) => void;
}

export default function LinkClassModal({
  isOpen,
  onClose,
  classSearchQuery,
  setClassSearchQuery,
  availableSubjects,
  onLinkClass,
}: LinkClassModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#EFECE6] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-extrabold text-[#121212] tracking-tight">Link Class</h3>
            <p className="text-[11px] text-zinc-400 font-medium">Search available subjects to link to this institution</p>
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
              placeholder="Search class by name..."
              value={classSearchQuery}
              onChange={(e) => setClassSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-zinc-200 bg-white text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[#d97706]/20 focus:border-[#f97316] transition-all"
              autoFocus
            />
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 min-h-[220px] max-h-[380px] flex flex-col gap-1.5 no-scrollbar">
          {availableSubjects.length > 0 ? (
            availableSubjects.map((sub) => {
              const initials = sub.name
                ? sub.name.split(" ").map((w: string) => w[0]).join("").substring(0, 2).toUpperCase()
                : "?";
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => onLinkClass(sub)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-zinc-50 text-left transition-all group active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#facc15]/10 border border-[#f97316]/15 text-[#d97706] text-[11px] font-black group-hover:bg-[#facc15]/20 transition-colors">
                    {initials}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[13px] font-bold text-zinc-800 group-hover:text-[#121212] truncate">
                      {sub.name}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-medium truncate">
                      {sub.room || "Online Classroom"}
                    </span>
                  </div>
                  <Plus className="w-4 h-4 text-zinc-300 group-hover:text-[#d97706] transition-colors mr-1" />
                </button>
              );
            })
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center px-4">
              <Search className="w-8 h-8 text-zinc-300 mb-2" />
              <span className="text-[12.5px] font-bold text-zinc-600">No classes found</span>
              <p className="text-[11px] text-zinc-400 mt-1 max-w-[240px] font-medium">
                All created classes are already linked or no match was found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
