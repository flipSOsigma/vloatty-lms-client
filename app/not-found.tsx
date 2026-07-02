"use client";

import React from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-6 sm:p-12 select-none text-center">
      {/* Big 404 Text */}
      <div className="relative mb-6 select-none">
        <h1 className="text-[120px] sm:text-[150px] font-black leading-none text-zinc-955/5 tracking-tighter">
          404
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-zinc-200/50 shadow-2xs">
            Page Not Found
          </span>
        </div>
      </div>

      {/* Title Text */}
      <h2 className="text-xl sm:text-2xl font-black text-zinc-955 tracking-tight mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
        Lost in space?
      </h2>

      {/* Description */}
      <p className="text-[12.5px] sm:text-[13.5px] text-zinc-500 font-semibold leading-relaxed mb-8 max-w-sm animate-in fade-in slide-in-from-bottom-3 duration-500">
        The page you are looking for doesn't exist, has been removed, or is temporarily down. Check the web address or choose one of the options below.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Link
          href="/dashboard"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#121212] hover:bg-zinc-900 text-white font-extrabold rounded-2xl text-[11.5px] shadow-xs transition-all active:scale-[0.98]"
        >
          <span>Go to Dashboard</span>
        </Link>
        <Link
          href="/dashboard/subjects"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 hover:text-zinc-900 font-extrabold rounded-2xl text-[11.5px] transition-all active:scale-[0.98]"
        >
          <BookOpen className="w-4 h-4 text-zinc-450 animate-pulse" />
          <span>Browse Subjects</span>
        </Link>
      </div>
    </div>
  );
}
