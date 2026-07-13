"use client";

import React, { useEffect, useRef } from "react";
import { X, Calendar } from "lucide-react";

interface AccountPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  x: number;
  y: number;
  user: {
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
    banner?: string | null;
    joinedAt?: string;
  } | null;
}

export default function AccountPreview({ isOpen, onClose, x, y, user }: AccountPreviewProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  const getInitials = (name: string) => {
    return name
      .split(/\s+/)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  if (!isOpen || !user) return null;

  // Prevent popover from rendering offscreen
  const width = 256; // 64w
  const height = 210;
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1024;
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 768;

  const adjustedX = x + width > viewportWidth ? viewportWidth - width - 16 : x;
  const adjustedY = y + height > viewportHeight ? viewportHeight - height - 16 : y;

  return (
    <>
      {/* Invisible backdrop for easy closing */}
      <div
        className="fixed inset-0 z-[198] bg-transparent"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onClose();
        }}
      />

      <div
        ref={cardRef}
        className="fixed w-64 bg-white border border-[#EFECE6]/80 rounded-[20px] shadow-lg overflow-hidden z-[199] text-left animate-in fade-in slide-in-from-top-2 duration-200 select-none"
        style={{
          left: `${adjustedX}px`,
          top: `${adjustedY}px`,
        }}
      >
        {/* Miniature Banner */}
        <div className="h-16 w-full relative bg-gradient-to-r from-sky-100 via-blue-50 to-emerald-50/50">
          {user.banner && (
            <img
              src={user.banner}
              alt="Mini Banner"
              className="w-full h-full object-cover"
            />
          )}
          {/* Close button on banner */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/60 hover:bg-white/95 border border-white/20 flex items-center justify-center text-zinc-650 transition-all cursor-pointer z-10"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* Avatar overlapping mini-banner */}
        <div className="relative px-4 pb-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white bg-white -mt-6 absolute left-4 shadow-xs">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#121212] text-white flex items-center justify-center font-bold text-sm">
                {getInitials(user.name)}
              </div>
            )}
          </div>

          {/* Stacked Details beneath the avatar */}
          <div className="pt-7 flex flex-col gap-0.5">
            <span className="text-[13px] font-black text-zinc-900 leading-none truncate">
              {user.name}
            </span>
            <span className="text-[10px] text-zinc-450 font-bold truncate mt-0.5">
              {user.email}
            </span>
            {user.joinedAt && (
              <span className="text-[9px] text-zinc-400 font-semibold mt-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-zinc-350" />
                Joined {new Date(user.joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </span>
            )}
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="p-2 border-t border-zinc-100 flex flex-col gap-1 bg-zinc-50/50">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold text-zinc-650 hover:text-zinc-850 hover:bg-zinc-150/40 transition-colors w-full cursor-pointer border border-zinc-200 bg-white"
          >
            <span>Close Preview</span>
          </button>
        </div>
      </div>
    </>
  );
}
