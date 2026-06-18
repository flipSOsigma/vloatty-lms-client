"use client";

import React, { useEffect, useState } from "react";
import {
  Asterisk,
  Calendar,
  MoreVertical,
} from "lucide-react";
import { useLms } from "../../context/LmsContext";

export default function Header() {
  const { currentUser } = useLms();

  const [dateString, setDateString] = useState("");

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      setDateString(now.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" }));
    };
    updateDate();
  }, []);

  return (
    <header className="flex items-center justify-between w-full select-none py-4 px-6 md:px-8 bg-transparent">
      {/* Left side: Page Title */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col text-left">
          <span className="text-[12px] font-semibold text-zinc-400">Academic Portal</span>
          <h1 className="text-[34px] font-semibold text-zinc-800 tracking-tight leading-none mt-1">
            Dashboard
          </h1>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#facc15] flex items-center justify-center text-zinc-800 shadow-sm border border-zinc-200/20 font-semibold text-lg select-none relative -bottom-1">
          <Asterisk />
        </div>
      </div>

      {/* Right side: Welcome message & Date pill & options button */}
      <div className="flex items-center gap-4">
        {/* Welcome message */}
        <div className="hidden md:flex flex-col text-right">
          <span className="text-[12.5px] font-semibold text-zinc-700">
            Hi {currentUser?.name ? currentUser.name.split(/\s+/)[0] : "User"},
          </span>
          <span className="text-[9.5px] text-zinc-400 font-medium">
            Welcome to Vloatty
          </span>
        </div>

        {/* Date Selector Pill */}
        <div className="flex items-center gap-2 bg-white border border-[#E5E1D8]/70 rounded-full px-4 py-2 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.02)] text-zinc-700 text-[11.5px] font-semibold">
          <Calendar className="w-4.5 h-4.5 text-zinc-400" />
          <span>{dateString || "Sat, 26 Aug"}</span>
          <span className="w-1.5 h-1.5 bg-[#facc15] rounded-full ml-1" />
        </div>

        {/* Header Options Button */}
        <button className="w-10 h-10 rounded-full bg-white border border-[#E5E1D8]/60 flex items-center justify-center text-zinc-600 hover:text-zinc-800 cursor-pointer hover:bg-zinc-50 transition-colors shadow-[0_2px_8px_-3px_rgba(0,0,0,0.02)]">
          <MoreVertical className="w-4.5 h-4.5" />
        </button>
      </div>
    </header>
  );
}
