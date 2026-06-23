"use client";

import React, { useState } from "react";
import { MoreHorizontal, Edit3, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import ContextMenu from "./ContextMenu";

interface Institution {
  id: string;
  name: string;
  description?: string;
  subscriptionStatus: string;
  thumbnail?: string;
  users?: any[];
  subjects?: any[];
  createdAt?: string;
}

interface InstitutionCardProps {
  inst: Institution;
  onDelete: (id: string) => void;
}

export default function InstitutionCard({ inst, onDelete }: InstitutionCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuOpen(!menuOpen);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuOpen(true);
  };

  const getStatusColor = (status: string) => {
    if (status === "premium") {
      return {
        logoBg: "bg-[#facc15]/10 text-[#d97706]",
        tagBg: "bg-[#facc15]/15 text-[#d97706] border border-[#facc15]/30",
        colorHex: "#facc15"
      };
    }
    if (status === "professional") {
      return {
        logoBg: "bg-zinc-100 text-zinc-900",
        tagBg: "bg-[#121212] text-white border border-[#121212]/10",
        colorHex: "#121212"
      };
    }
    return {
      logoBg: "bg-zinc-50 text-zinc-400",
      tagBg: "bg-zinc-100 border border-zinc-200 text-zinc-500",
      colorHex: "#a1a1aa"
    };
  };

  const theme = getStatusColor(inst.subscriptionStatus);

  const timeAgo = (dateStr?: string) => {
    if (!dateStr) return "5 days ago";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "5 days ago";
      const seconds = Math.floor((new Date().getTime() - d.getTime()) / 1000);
      let interval = Math.floor(seconds / 31536000);
      if (interval >= 1) return interval === 1 ? "1 year ago" : `${interval} years ago`;
      interval = Math.floor(seconds / 2592000);
      if (interval >= 1) return interval === 1 ? "1 month ago" : `${interval} months ago`;
      interval = Math.floor(seconds / 86400);
      if (interval >= 1) return interval === 1 ? "1 day ago" : `${interval} days ago`;
      interval = Math.floor(seconds / 3600);
      if (interval >= 1) return interval === 1 ? "1 hour ago" : `${interval} hours ago`;
      return "just now";
    } catch (e) {
      return "5 days ago";
    }
  };

  return (
    <>
      <div
        onClick={() => router.push(`/dashboard/institutions/${inst.id}`)}
        onContextMenu={handleContextMenu}
        className="bg-white rounded-[32px] border border-[#EFECE6] p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:shadow-[#121212]/5 hover:scale-[1.015] cursor-pointer select-none h-full text-left shadow-xs group"
      >
        <div className="flex flex-col gap-6 h-full w-full justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between w-full">
              {inst.thumbnail && inst.thumbnail.trim().length > 0 ? (
                <img
                  src={inst.thumbnail}
                  alt={inst.name}
                  className="w-12 h-12 rounded-full object-cover shadow-sm border border-zinc-100"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-[16px] shadow-sm border border-zinc-100"
                  style={{ backgroundColor: `${theme.colorHex}10`, color: theme.colorHex }}
                >
                  {inst.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleMoreClick}
                  className="w-8 h-8 rounded-full hover:bg-zinc-50 border border-zinc-100/80 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer flex-shrink-0"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col mt-2">
              <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                <span>{inst.name}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-300 inline-block" />
                <span>{timeAgo(inst.createdAt)}</span>
              </span>
              <h3 className="text-[17px] font-black text-zinc-950 tracking-tight leading-snug mt-1 line-clamp-2 min-h-[50px]">
                {inst.description ? inst.description.split(".")[0] : inst.name}
              </h3>
            </div>

            <div className="flex flex-wrap gap-2 mt-1">
              <span className={`text-[10px] font-semibold px-3 py-1 rounded-lg ${theme.tagBg}`}>
                {inst.subscriptionStatus.charAt(0).toUpperCase() + inst.subscriptionStatus.slice(1)}
              </span>
              <span className="text-[10px] font-semibold px-3 py-1 rounded-lg bg-zinc-50 border border-zinc-200/60 text-zinc-500">
                {inst.users ? inst.users.length : 0} {inst.users && inst.users.length === 1 ? "User" : "Users"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-100/80 pt-4 mt-2">
            <div className="flex flex-col text-left">
              <span className="text-[12.5px] font-black text-zinc-950">
                {inst.subjects ? inst.subjects.length : 0} {inst.subjects && inst.subjects.length === 1 ? "Subject" : "Subjects"}
              </span>
              <span className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                Academic Program
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/dashboard/institutions/${inst.id}`);
              }}
              className="bg-[#121212] text-white font-black text-[11px] px-5 py-2.5 rounded-full transition-all duration-350 cursor-pointer shadow-sm active:scale-[0.98] group-hover:bg-[#facc15] group-hover:text-zinc-950 group-hover:shadow-md group-hover:shadow-[#facc15]/20"
            >
              View details
            </button>
          </div>
        </div>
      </div>

      <ContextMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        x={menuPos.x}
        y={menuPos.y}
        options={[
          {
            label: "Edit Details",
            icon: Edit3,
            onClick: () => router.push(`/dashboard/institutions/${inst.id}/edit`),
          },
          {
            label: "Delete",
            icon: Trash2,
            danger: true,
            onClick: () => onDelete(inst.id),
          },
        ]}
      />
    </>
  );
}
