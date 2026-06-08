"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  User,
  Bell,
  RefreshCw,
  Edit2,
  ChevronDown,
  Settings,
  LogOut,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import { useLms } from "../../context/LmsContext";

export default function Header() {
  const {
    selectedView,
    setSelectedView,
    searchQuery,
    setSearchQuery,
    selectedCategories,
    toggleCategory,
    setShowAddModal,
  } = useLms();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const categories = ["Lectures", "Labs", "Seminars", "Quizzes"];

  const notifications = [
    {
      id: 1,
      title: "Calculus I Session",
      desc: "Starts in 10 minutes in Room 312.",
      time: "5m ago",
      unread: true,
    },
    {
      id: 2,
      title: "Physics Module Added",
      desc: "Prof. Feynman uploaded 'Classical Mechanics'.",
      time: "2h ago",
      unread: false,
    },
    {
      id: 3,
      title: "New Assignment",
      desc: "Submit homework for Computer Science.",
      time: "5h ago",
      unread: false,
    },
  ];

  return (
    <header className="flex flex-col gap-6 w-full select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between w-full">
        {/* Polish: Bigger Search Bar Container */}
        <div className="flex items-center flex-1 max-w-[760px] bg-transparent border border-[#E5E1D8] rounded-full p-1.5 pl-3 gap-3.5 shadow-sm">
          {/* Bigger search icon */}
          <div className="w-10 h-10 rounded-full bg-[#f25c88]/10 text-[#f25c88] flex items-center justify-center flex-shrink-0">
            <Search className="w-4.5 h-4.5" />
          </div>
          {/* Input field */}
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-[#121212] text-[15px] placeholder-zinc-400 font-semibold px-1 min-w-[80px]"
          />
          {/* Category badges */}
          <div className="hidden md:flex items-center gap-1.5 pr-2">
            <span className="text-[11px] text-zinc-400 font-bold mr-1">In:</span>
            {categories.map((cat) => {
              const isSelected = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1 rounded-full text-[12px] font-bold transition-all duration-200 border cursor-pointer ${
                    isSelected
                      ? "border-[#f25c88] text-[#f25c88] bg-[#f25c88]/5 border-solid"
                      : "border-zinc-300 text-zinc-600 border-dashed hover:border-zinc-500"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Polish: Separate profile and bell circle buttons with dropdown bubbles */}
        <div className="flex items-center gap-3.5">
          {/* Notification Bell Circle Wrapper */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }}
              className="relative w-12 h-12 rounded-full bg-[#121212] text-zinc-300 hover:text-white flex items-center justify-center hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer shadow-md z-10"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-3.5 right-3.5 w-1.5 h-1.5 bg-[#f25c88] rounded-full"></span>
            </button>

            {/* Notification Popover Bubble */}
            {showNotifications && (
              <div className="absolute right-0 mt-3.5 w-[320px] bg-[#FAF7F2] border border-[#E5E1D8] rounded-3xl p-5 shadow-2xl z-50 origin-top-right transform scale-100 animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-4 text-left">
                <div className="flex items-center justify-between border-b border-[#E5E1D8]/60 pb-2">
                  <span className="text-[13px] font-black text-[#121212]">Notifications</span>
                  <button className="text-[10px] text-zinc-400 font-bold hover:text-zinc-600 cursor-pointer">
                    Clear all
                  </button>
                </div>
                <div className="flex flex-col gap-3 max-h-[260px] overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <div key={n.id} className="flex gap-3 items-start hover:bg-white/50 p-2 rounded-2xl transition-colors cursor-pointer relative">
                      <div className="w-8 h-8 rounded-full bg-[#f25c88]/10 flex items-center justify-center text-[#f25c88] flex-shrink-0 mt-0.5">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 w-full">
                          <span className="text-[11px] font-extrabold text-zinc-900 truncate">{n.title}</span>
                          <span className="text-[9px] text-zinc-400 font-bold flex-shrink-0">{n.time}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-semibold leading-normal break-words line-clamp-2">
                          {n.desc}
                        </p>
                      </div>
                      {n.unread && (
                        <span className="absolute top-3.5 right-1 w-1.5 h-1.5 bg-[#f25c88] rounded-full"></span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Circle Wrapper */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              className="w-12 h-12 rounded-full bg-[#121212] text-zinc-300 hover:text-white flex items-center justify-center hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer shadow-md z-10"
            >
              <User className="w-5 h-5" />
            </button>

            {/* Profile Popover Bubble */}
            {showProfile && (
              <div className="absolute right-0 mt-3.5 w-64 bg-[#FAF7F2] border border-[#E5E1D8] rounded-3xl p-5 shadow-2xl z-50 origin-top-right transform scale-100 animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-4 text-left">
                {/* Profile Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-[#E5E1D8]/60">
                  <div className="w-10 h-10 rounded-full bg-[#121212] text-white flex items-center justify-center font-bold text-[14px] flex-shrink-0 shadow-sm border border-zinc-700">
                    TY
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13.5px] font-extrabold text-zinc-950 truncate">Turing Yeager</span>
                    <span className="text-[9.5px] text-zinc-400 font-bold truncate">turing.y@vloatty.edu</span>
                  </div>
                </div>

                {/* Menu Options */}
                <div className="flex flex-col gap-1 py-1">
                  <button className="flex items-center justify-between px-2.5 py-2 hover:bg-zinc-200/40 rounded-xl text-[11.5px] text-zinc-700 font-bold transition-all duration-200 cursor-pointer text-left w-full group">
                    <span className="flex items-center gap-2.5">
                      <User className="w-4 h-4 text-zinc-400 group-hover:text-[#121212]" />
                      My Profile
                    </span>
                    <span className="text-[8.5px] bg-[#f25c88]/10 text-[#f25c88] px-1.5 py-0.5 rounded-full font-bold">Edit</span>
                  </button>
                  <button className="flex items-center justify-between px-2.5 py-2 hover:bg-zinc-200/40 rounded-xl text-[11.5px] text-zinc-700 font-bold transition-all duration-200 cursor-pointer text-left w-full group">
                    <span className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4 text-zinc-400 group-hover:text-[#121212]" />
                      My Courses
                    </span>
                  </button>
                  <button className="flex items-center justify-between px-2.5 py-2 hover:bg-zinc-200/40 rounded-xl text-[11.5px] text-zinc-700 font-bold transition-all duration-200 cursor-pointer text-left w-full group">
                    <span className="flex items-center gap-2.5">
                      <Settings className="w-4 h-4 text-zinc-400 group-hover:text-[#121212]" />
                      Account Settings
                    </span>
                  </button>
                </div>

                {/* Logout Button */}
                <button className="flex items-center gap-2 justify-center w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-xl text-[12px] font-bold transition-colors cursor-pointer border border-red-200/20 mt-1">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Action Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-end gap-4 w-full">
        {/* Controls (Add Event, View Switchers) */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Add Event Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#121212] text-white text-[13px] font-semibold rounded-full hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
          >
            <span>Add event</span>
          </button>

          {/* Sync Button */}
          <button className="p-2.5 rounded-full border border-[#E5E1D8] text-zinc-700 hover:bg-zinc-100 transition-colors shadow-sm bg-transparent cursor-pointer">
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Edit Button */}
          <button className="p-2.5 rounded-full border border-[#E5E1D8] text-zinc-700 hover:bg-zinc-100 transition-colors shadow-sm bg-transparent cursor-pointer">
            <Edit2 className="w-4 h-4" />
          </button>

          {/* View switcher: Today / Week / Month */}
          <div className="flex bg-[#EFECE6]/60 p-0.5 rounded-full border border-[#E5E1D8]">
            {(["today", "week", "month"] as const).map((view) => {
              const active = selectedView === view;
              return (
                <button
                  key={view}
                  onClick={() => setSelectedView(view)}
                  className={`px-4 py-1.5 rounded-full text-[12px] font-semibold capitalize transition-all duration-200 cursor-pointer ${
                    active
                      ? "bg-[#121212] text-white shadow-sm"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  {view}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
