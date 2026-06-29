"use client";

import React from "react";
import { Settings, Bell, Menu, LogOut, User } from "lucide-react";
import { useLms } from "../../context/LmsContext";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps = {}) {
  const { currentUser, setMobileSidebarOpen, logout } = useLms();
  const pathname = usePathname();

  const [isPopupOpen, setIsPopupOpen] = React.useState(false);
  const popupRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsPopupOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navTabs = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Schedule", href: "/dashboard/schedule" },
    { name: "Subjects", href: "/dashboard/subjects" },
    { name: "Storage", href: "/dashboard/storage" },
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
    <header className="flex items-center justify-between w-full select-none py-4 px-2 md:px-4 bg-transparent border-b border-[#EFECE6]/40 mb-2 gap-4">
      {/* Hamburger button on mobile */}
      <button 
        onClick={() => setMobileSidebarOpen(true)}
        className="lg:hidden w-10 h-10 rounded-full bg-white border border-[#EFECE6] flex items-center justify-center text-zinc-650 hover:text-zinc-850 hover:bg-zinc-50/80 cursor-pointer transition-colors shadow-sm shrink-0 animate-in fade-in duration-200"
        aria-label="Open sidebar menu"
      >
        <Menu className="w-5 h-5 stroke-[2]" />
      </button>

      {/* Left side: Navigation Tabs (hidden on mobile/tablet, visible on desktop) */}
      <div className="hidden lg:flex items-center gap-1 bg-zinc-100 p-1 rounded-full border border-zinc-200/40">
        {navTabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== "/dashboard" && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`px-5 py-2 rounded-full text-xs font-extrabold tracking-tight transition-all cursor-pointer ${
                isActive
                  ? "bg-[#121212] text-white shadow-sm"
                  : "text-zinc-550 hover:text-zinc-800"
              }`}
            >
              {tab.name}
            </Link>
          );
        })}
        {/* Extra tab */}
        <span className="px-5 py-2 text-zinc-400 text-xs font-extrabold cursor-not-allowed select-none">
          Calendar
        </span>
      </div>

      {/* Right side: Settings, Notification, and User Profile */}
      <div className="flex items-center gap-4 relative" ref={popupRef}>
        {/* Settings button */}
        <button className="w-10 h-10 rounded-full bg-white border border-[#EFECE6] flex items-center justify-center text-zinc-600 hover:text-zinc-850 hover:bg-zinc-50/80 cursor-pointer transition-colors shadow-sm">
          <Settings className="w-4.5 h-4.5 stroke-[2]" />
        </button>

        {/* Notification button */}
        <button className="w-10 h-10 rounded-full bg-white border border-[#EFECE6] flex items-center justify-center text-zinc-650 hover:text-zinc-850 hover:bg-zinc-50/80 cursor-pointer transition-colors shadow-sm relative">
          <Bell className="w-4.5 h-4.5 stroke-[2]" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#facc15] rounded-full border border-white" />
        </button>

        {/* User Card (clickable dropdown toggle) */}
        {currentUser && (
          <div 
            onClick={() => setIsPopupOpen(!isPopupOpen)}
            className="flex items-center gap-3 pl-4 border-l border-zinc-200 cursor-pointer hover:opacity-85 select-none"
          >
            {/* User Avatar */}
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover border border-[#EFECE6] shadow-sm shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#facc15]/10 text-[#d97706] flex items-center justify-center text-[13px] font-extrabold border border-[#facc15]/20 shadow-sm shrink-0">
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

        {/* Profile Card Preview Dropdown Popup */}
        {isPopupOpen && currentUser && (
          <div className="absolute right-0 top-12 w-64 bg-white border border-[#EFECE6]/80 rounded-[20px] shadow-lg overflow-hidden z-50 text-left animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Miniature Banner */}
            <div className="h-16 w-full relative bg-gradient-to-r from-sky-100 via-blue-50 to-emerald-50/50">
              {currentUser.banner && (
                <img
                  src={currentUser.banner}
                  alt="Mini Banner"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Avatar overlapping mini-banner */}
            <div className="relative px-4 pb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-xs bg-white -mt-6 absolute left-4">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#121212] text-white flex items-center justify-center font-bold text-base">
                    {getInitials(currentUser.name)}
                  </div>
                )}
              </div>

              {/* Stacked Details beneath the avatar */}
              <div className="pt-7 flex flex-col gap-0.5">
                <span className="text-[13px] font-black text-zinc-900 leading-none truncate">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-zinc-450 font-bold truncate mt-0.5">
                  {currentUser.email}
                </span>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="p-2 border-t border-zinc-100 flex flex-col gap-1 bg-zinc-50/50">
              <Link
                href="/dashboard/profile"
                onClick={() => setIsPopupOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11.5px] font-bold text-zinc-650 hover:text-zinc-850 hover:bg-zinc-150/40 transition-colors w-full cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-zinc-400" />
                <span>View Profile</span>
              </Link>
              
              <button
                onClick={() => {
                  setIsPopupOpen(false);
                  logout();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11.5px] font-bold text-red-600 hover:bg-red-50/50 transition-colors w-full cursor-pointer text-left"
              >
                <LogOut className="w-3.5 h-3.5 text-red-500" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
