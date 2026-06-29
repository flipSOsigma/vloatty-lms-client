"use client";

import React from "react";

interface FolderCardProps {
  name: string;
  itemCount: number;
  subtitle?: string;
  leftStatNumber?: string | number;
  leftStatLabel?: string;
  rightStatNumber?: string | number;
  rightStatLabel?: string;
  bannerGradient?: string;
  bannerColor?: string;
  bannerHasStripes?: boolean;
  onClick: () => void;
}

export default function FolderCard({
  name,
  itemCount,
  subtitle,
  leftStatNumber,
  leftStatLabel,
  rightStatNumber,
  rightStatLabel,
  bannerGradient,
  bannerColor = "#121212",
  bannerHasStripes = true,
  onClick,
}: FolderCardProps) {
  // Safe defaults matching ref.jpg layout
  const displaySubtitle = subtitle || "Files Directory";
  const displayLeftNum = leftStatNumber !== undefined ? leftStatNumber : itemCount;
  const displayLeftLabel = leftStatLabel || "Files";
  const displayRightNum = rightStatNumber !== undefined ? rightStatNumber : "1";
  const displayRightLabel = rightStatLabel || "Folder";

  const getBannerStyle = () => {
    if (bannerGradient) {
      // If bannerGradient is a tailwind gradient format e.g. "from-blue-500...", we don't apply style directly.
      // But we can check if it starts with "from-" or contains gradient color keywords.
      return {};
    }
    
    const stripeGradient = "repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(229, 225, 216, 0.8) 12px, rgba(229, 225, 216, 0.8) 24px)";
    return {
      backgroundColor: bannerColor,
      backgroundImage: bannerHasStripes ? stripeGradient : undefined,
    };
  };

  return (
    <div
      onClick={onClick}
      className="group bg-[#F9F7F2] border border-[#EFECE6] rounded-[24px] overflow-hidden flex flex-col justify-between text-left h-[240px] relative transition-all duration-300 hover:-translate-y-1 hover:shadow-xs cursor-pointer select-none"
    >
      {/* Top Banner: Supports Tailwind classes via bannerGradient or inline styled stripes */}
      <div 
        className={`h-[100px] w-full relative shrink-0 overflow-hidden ${bannerGradient || ""}`}
        style={getBannerStyle()}
      >
        {/* Ambient glow decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
      </div>

      {/* SVG Folder Tab Cutout Mask (with preserveAspectRatio="none" to stretch full width) */}
      <div className="relative w-full shrink-0 -mt-8 z-10 bg-transparent">
        <svg 
          viewBox="0 0 100 24" 
          className="w-full h-8 text-[#F9F7F2] fill-current"
          preserveAspectRatio="none"
        >
          <path d="M 0,24 L 0,6 Q 0,0 6,0 L 40,0 Q 46,0 50,8 L 56,18 Q 60,24 66,24 L 100,24 Z" />
        </svg>
      </div>

      {/* Content Area */}
      <div className="flex-grow bg-[#F9F7F2] px-5 pb-5 pt-3.5 flex flex-col justify-between z-10">
        <div className="flex flex-col text-left">
          <span 
            className="text-[14px] font-bold text-zinc-900 truncate leading-tight group-hover:text-zinc-950" 
            title={name}
          >
            {name}
          </span>
          <span className="text-[10.5px] text-zinc-455 font-normal mt-1 block">
            {displaySubtitle}
          </span>
        </div>

        {/* Stats Footer Row */}
        <div className="flex items-end justify-between mt-auto">
          {/* Left Stat: Large numeric prefix, small label suffix */}
          <div className="flex items-baseline text-zinc-800">
            <span className="text-[22px] font-bold leading-none">{displayLeftNum}</span>
            <span className="text-[10px] text-zinc-455 font-normal ml-1 leading-none">{displayLeftLabel}</span>
          </div>

          {/* Right Stat: Standard inline text */}
          <div className="text-[12px] font-normal text-zinc-800">
            {displayRightNum} {displayRightLabel}
          </div>
        </div>
      </div>
    </div>
  );
}
