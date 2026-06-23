"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSaving: boolean;
  onSave: () => void;
  onDecline: () => void;
}

export default function UnsavedChangesModal({
  isOpen,
  onClose,
  isSaving,
  onSave,
  onDecline,
}: UnsavedChangesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#EFECE6] shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 select-none">
        <div className="p-6 flex flex-col items-center text-center gap-4">
          <div className="flex items-center justify-between w-full">
            <div className="w-8 h-8" />
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="text-[17px] font-extrabold text-[#121212] tracking-tight">
              Unsaved Changes
            </h3>
            <p className="text-[12.5px] text-zinc-500 font-medium max-w-xs leading-relaxed">
              You have edited the institution details. Do you want to save your changes before leaving?
            </p>
          </div>
        </div>

        <div className="px-6 pb-6 pt-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="w-full py-3 bg-[#121212] hover:bg-zinc-800 text-white font-bold rounded-2xl text-[12px] shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            ) : (
              "Save Changes"
            )}
          </button>
          <div className="flex items-center gap-2 w-full">
            <button
              type="button"
              onClick={onDecline}
              disabled={isSaving}
              className="flex-1 py-3 border border-zinc-200 text-rose-600 hover:text-rose-700 hover:border-rose-300 hover:bg-rose-50/20 font-bold rounded-2xl text-[12px] bg-white transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
            >
              Decline Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 py-3 border border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:border-zinc-300 font-bold rounded-2xl text-[12px] bg-white hover:bg-zinc-50/50 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
            >
              Keep Editing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
