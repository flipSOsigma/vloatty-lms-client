"use client";

import React from "react";
import { AlertTriangle, Globe, Trash2 } from "lucide-react";

interface DangerZoneSectionProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  setIsDeleteModalOpen: (val: boolean) => void;
}

export default function DangerZoneSection({
  isOpen,
  setIsOpen,
  setIsDeleteModalOpen,
}: DangerZoneSectionProps) {
  return (
    <div id="danger-zone" className="flex flex-col gap-6 w-full mb-16 lg:pl-12 mt-12 scroll-mt-24">
      <div className="flex flex-col">
        <h3 className="text-[14.5px] font-bold text-[#121212] flex items-center gap-2">
          <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
          Danger Zone
        </h3>
        <p className="text-[12px] text-zinc-400 font-medium -mt-1 pl-6">
          Manage high-risk subject visibility settings and permanent course deletions.
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full mt-2 animate-in fade-in duration-200">
        <div className="flex items-center justify-between py-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-extrabold text-zinc-800 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-zinc-500" />
              Open Class Visibility
            </span>
            <span className="text-[10px] text-zinc-400 font-bold leading-normal">
              Allow any authenticated user to search and join this class
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
              isOpen ? "bg-[#f25c88]" : "bg-zinc-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isOpen ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-3 border-t border-zinc-100">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-extrabold text-red-600 flex items-center gap-1.5">
              <Trash2 className="w-4 h-4 text-red-500" />
              Delete Subject
            </span>
            <span className="text-[10px] text-zinc-400 font-bold leading-normal">
              Deleting this subject is permanent and cannot be undone. All classes, events, and resources will be removed.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-6 py-2.5 bg-red-50 hover:bg-red-100/80 border border-red-200 text-red-600 hover:text-red-700 font-extrabold rounded-full text-[12px] transition-all cursor-pointer shadow-sm active:scale-[0.98]"
          >
            Delete Subject
          </button>
        </div>
      </div>
    </div>
  );
}
