"use client";

import React from "react";
import { AlertTriangle, HelpCircle, Sparkles, Trash2 } from "lucide-react";

interface DangerZoneSectionProps {
  statusInput: string;
  setStatusInput: (val: string) => void;
  setIsDeleteModalOpen: (val: boolean) => void;
  showToast: (msg: string, type: "success" | "error") => void;
}

export default function DangerZoneSection({
  statusInput,
  setStatusInput,
  setIsDeleteModalOpen,
  showToast,
}: DangerZoneSectionProps) {
  return (
    <div id="danger-zone" className="flex flex-col gap-6 w-full mb-16 lg:pl-12 mt-12 scroll-mt-24">
      <div className="flex flex-col">
        <div className="flex items-center justify-between w-full">
          <h3 className="text-[14.5px] font-bold text-[#121212] flex items-center gap-2">
            <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
            Danger Zone
          </h3>
          <button
            type="button"
            onClick={() => showToast("Manage high-risk institution settings, subscription tiers, and deletions.", "success")}
            className="w-5 h-5 rounded-full bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-400 hover:text-zinc-600 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 group/help relative"
          >
            <HelpCircle className="w-3 h-3" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-zinc-950 text-white text-[9px] font-bold rounded-lg opacity-0 group-hover/help:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-md z-30 border border-zinc-800">
              Help & Docs
            </span>
          </button>
        </div>
        <p className="text-[12px] text-zinc-400 font-medium -mt-1 pl-6">
          Configure subscription levels and manage permanent organization deletion settings.
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full mt-2 animate-in fade-in duration-200">
        <div className="flex items-center justify-between py-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-extrabold text-zinc-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-zinc-500" />
              Subscription level
            </span>
            <span className="text-[10px] text-zinc-400 font-bold leading-normal">
              Control organization level access (Free, Premium, or Professional)
            </span>
          </div>
          <select
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value)}
            className="px-4 py-2 rounded-xl border border-zinc-200 text-[13.5px] font-semibold bg-white outline-none cursor-pointer focus:border-[#f25c88]"
          >
            <option value="free">Free Tier</option>
            <option value="premium">Premium</option>
            <option value="professional">Professional</option>
          </select>
        </div>

        <div className="flex items-center justify-between py-3 border-t border-zinc-100">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-extrabold text-red-600 flex items-center gap-1.5">
              <Trash2 className="w-4 h-4 text-red-500" />
              Delete Institution
            </span>
            <span className="text-[10px] text-zinc-400 font-bold leading-normal">
              Deleting this institution is permanent and cannot be undone. All classes and users will be updated.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-6 py-2.5 bg-red-50 hover:bg-red-100/80 border border-red-200 text-red-600 hover:text-red-700 font-extrabold rounded-full text-[12px] transition-all cursor-pointer shadow-sm active:scale-[0.98]"
          >
            Delete Institution
          </button>
        </div>
      </div>
    </div>
  );
}
