"use client";

import React from "react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  BarChart3,
  BookOpen,
  FileText,
  MessageSquare,
  DollarSign,
  FolderOpen,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useLms } from "../../context/LmsContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const generalItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Schedule", icon: Calendar, href: "/dashboard/schedule" },
    { name: "Patients", icon: Users, href: "#" },
    { name: "Statistics & reports", icon: BarChart3, href: "#" },
    { name: "Education", icon: BookOpen, href: "#" },
    { name: "My articles", icon: FileText, href: "#" },
  ];

  const toolsItems = [
    { name: "Chats & calls", icon: MessageSquare, href: "#" },
    { name: "Billing", icon: DollarSign, href: "#" },
    { name: "Documents base", icon: FolderOpen, href: "#" },
    { name: "Settings", icon: Settings, href: "#" },
  ];

  return (
    <aside className="w-[260px] bg-[#121212] text-zinc-400 p-6 flex flex-col justify-between rounded-3xl m-4 mr-0 select-none">
      <div className="flex flex-col gap-8">
        {/* Brand / Logo */}
        <div className="flex items-center justify-between mt-2 px-2">
          <div className="flex items-center gap-2">
            <span className="text-white text-3xl font-semibold tracking-tight font-sans">
              Vloatty
            </span>
          </div>
          <button className="w-6 h-6 rounded-full bg-[#f25c88] flex items-center justify-center text-white hover:bg-[#d84b72] transition-colors shadow-sm cursor-pointer">
            <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>

        {/* General Nav */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold text-zinc-600 tracking-wider uppercase px-3">
            General
          </span>
          <nav className="flex flex-col gap-1 mt-1">
            {generalItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href !== "#" &&
                (pathname === item.href || (item.href === "/dashboard" && pathname === "/"));
              
              const content = (
                <>
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#f25c88]" : "text-zinc-500"}`} />
                  <span>{item.name}</span>
                </>
              );

              const buttonClass = `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? "text-[#f25c88] bg-white/[0.03] shadow-sm relative before:absolute before:left-0 before:top-1/4 before:h-1/2 before:w-[3px] before:bg-[#f25c88] before:rounded-r-md"
                  : "hover:text-zinc-200 hover:bg-white/[0.01]"
              }`;

              if (item.href === "#") {
                return (
                  <button key={item.name} className={buttonClass}>
                    {content}
                  </button>
                );
              }

              return (
                <Link key={item.name} href={item.href} className={buttonClass}>
                  {content}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Tools Nav */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold text-zinc-600 tracking-wider uppercase px-3">
            Tools
          </span>
          <nav className="flex flex-col gap-1 mt-1">
            {toolsItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium hover:text-zinc-200 hover:bg-white/[0.01] transition-all duration-200 cursor-pointer"
                >
                  <Icon className="w-4 h-4 text-zinc-500" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Log Out at bottom */}
      <div className="mt-auto pt-6 border-t border-zinc-800/50">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium hover:text-red-400 hover:bg-red-500/[0.02] transition-all duration-200 cursor-pointer text-zinc-500">
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
