"use client";

import React from "react";
import { Settings, Bell } from "lucide-react";
import { useLms } from "../../context/LmsContext";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps = {}) {
  const { currentUser } = useLms();
  const pathname = usePathname();

  const navTabs = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Schedule", href: "/dashboard/schedule" },
    { name: "Subjects", href: "/dashboard/subjects" },
  ];

  const getInitials = (name: string) => {
    return name
      .split(/\s+/)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <header className="flex items-center justify-between w-full select-none py-4 px-2 md:px-4 bg-transparent border-b border-[#EFECE6]/40 mb-2">
      {/* Left side: Navigation Tabs like in ref.jpg */}
      <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-full border border-zinc-200/40">
        {navTabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== "/dashboard" && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`px-5 py-2 rounded-full text-[12.5px] font-extrabold tracking-tight transition-all cursor-pointer ${
                isActive
                  ? "bg-[#121212] text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              {tab.name}
            </Link>
          );
        })}
        {/* Extra tab like ref.jpg */}
        <span className="px-5 py-2 text-zinc-400 text-[12.5px] font-extrabold cursor-not-allowed select-none">
          Calendar
        </span>
      </div>

      {/* Right side: Settings, Notification, and User Profile */}
      <div className="flex items-center gap-4">
        {/* Settings button */}
        <button className="w-10 h-10 rounded-full bg-white border border-[#EFECE6] flex items-center justify-center text-zinc-600 hover:text-zinc-850 hover:bg-zinc-50/80 cursor-pointer transition-colors shadow-sm">
          <Settings className="w-4.5 h-4.5 stroke-[2]" />
        </button>

        {/* Notification button */}
        <button className="w-10 h-10 rounded-full bg-white border border-[#EFECE6] flex items-center justify-center text-zinc-650 hover:text-zinc-850 hover:bg-zinc-50/80 cursor-pointer transition-colors shadow-sm relative">
          <Bell className="w-4.5 h-4.5 stroke-[2]" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#facc15] rounded-full border border-white" />
        </button>

        {/* User Card */}
        {currentUser && (
          <div className="flex items-center gap-3 pl-4 border-l border-zinc-200">
            {/* User Avatar */}
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover border border-[#EFECE6] shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#facc15]/10 text-[#d97706] flex items-center justify-center text-[13px] font-extrabold border border-[#facc15]/20 shadow-sm">
                {getInitials(currentUser.name)}
              </div>
            )}

            {/* User Details */}
            <div className="hidden md:flex flex-col text-left">
              <span className="text-[13px] font-bold text-zinc-900 leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[9.5px] text-zinc-400 font-semibold leading-none mt-0.5">
                {currentUser.email}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
