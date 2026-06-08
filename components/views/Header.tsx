"use client";

import React from "react";
import {
  Search,
  User,
  Bell,
  RefreshCw,
  Edit2,
  ChevronDown,
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

  const categories = ["Lectures", "Labs", "Seminars", "Quizzes"];

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

        {/* Polish: Separate profile and bell circle buttons, setting gear removed */}
        <div className="flex items-center gap-3.5">
          {/* Notification Bell Circle */}
          <button className="relative w-12 h-12 rounded-full bg-[#121212] text-zinc-300 hover:text-white flex items-center justify-center hover:scale-[1.03] transition-all cursor-pointer shadow-md">
            <Bell className="w-5 h-5" />
            <span className="absolute top-3.5 right-3.5 w-1.5 h-1.5 bg-[#f25c88] rounded-full"></span>
          </button>

          {/* User Profile Circle */}
          <button className="w-12 h-12 rounded-full bg-[#121212] text-zinc-300 hover:text-white flex items-center justify-center hover:scale-[1.03] transition-all cursor-pointer shadow-md">
            <User className="w-5 h-5" />
          </button>
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
