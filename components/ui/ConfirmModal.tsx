"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = false,
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#E5E1D8] shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 select-none">
        <div className="p-6 flex flex-col items-center text-center gap-4">
          <div className="flex items-center justify-between w-full">
            <div className="w-8 h-8" />
            {isDanger ? (
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
            )}
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
              {title}
            </h3>
            <p className="text-[12.5px] text-zinc-500 font-medium max-w-xs leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="px-6 pb-6 pt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 border border-zinc-200 text-zinc-700 hover:text-[#121212] hover:border-zinc-400 font-bold rounded-2xl text-[12px] bg-white hover:bg-[#FAF9F5] transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-3 text-white font-bold rounded-2xl text-[12px] transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-50 ${
              isDanger
                ? "bg-rose-600 hover:bg-rose-700 shadow-sm shadow-rose-100"
                : "bg-[#121212] hover:bg-zinc-800 shadow-sm"
            }`}
          >
            {isLoading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
