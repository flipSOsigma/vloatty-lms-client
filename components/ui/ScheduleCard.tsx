"use client";

import React from "react";
import { MapPin, GraduationCap } from "lucide-react";
import { LmsEvent } from "../../types/lms";

interface ScheduleCardProps {
  event: LmsEvent;
  lecturerName?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  stackIndex?: number;
  groupSize?: number;
}

export default function ScheduleCard({
  event,
  lecturerName,
  onClick,
  style,
  stackIndex,
  groupSize,
}: ScheduleCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const isHexColor = event.color && event.color.startsWith("#");

  const hexToRgba = (hex: string | undefined, opacity: number) => {
    if (!hex) return "";
    try {
      let c = hex.substring(1);
      if (c.length === 3) {
        c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
      }
      const r = parseInt(c.substring(0, 2), 16);
      const g = parseInt(c.substring(2, 4), 16);
      const b = parseInt(c.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    } catch (e) {
      return hex;
    }
  };

  let colorTheme = {
    bg: "bg-[#ECE8E0] hover:bg-[#E5E1D8]",
    border: "border border-zinc-200/50 border-l-[4px] border-l-zinc-400/40",
  };

  if (event.color === "yellow") {
    colorTheme = {
      bg: "bg-[#FAD56B] hover:bg-[#F8CC4F]",
      border: "border border-amber-400/20 border-l-[4px] border-l-amber-600/40",
    };
  } else if (event.color === "blue") {
    colorTheme = {
      bg: "bg-[#BFD3F7] hover:bg-[#ADC5F5]",
      border: "border border-blue-400/20 border-l-[4px] border-l-blue-600/40",
    };
  } else if (event.color === "image-text") {
    colorTheme = {
      bg: "bg-[#F3F0EA] hover:bg-[#ECE8E0]",
      border: "border border-[#E5E1D8]/80 border-l-[4px] border-l-zinc-400/40",
    };
  }

  const isDarkBg = isHexColor && (() => {
    try {
      let c = event.color!.substring(1);
      if (c.length === 3) {
        c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
      }
      const r = parseInt(c.substring(0, 2), 16);
      const g = parseInt(c.substring(2, 4), 16);
      const b = parseInt(c.substring(4, 6), 16);
      const yiq = (r * 299 + g * 587 + b * 114) / 1000;
      return yiq < 128;
    } catch (e) {
      return false;
    }
  })();

  const titleColor = isDarkBg ? "text-white" : "text-zinc-950";
  const metaColor = isDarkBg ? "text-white/80" : "text-zinc-500";
  const iconColor = isDarkBg ? "text-white/60" : "text-zinc-400";

  const sIndex = stackIndex || 0;
  const stackOffset = 20;
  const hoverExtra = 20;

  const baseTop = style?.top ? parseFloat(style.top as string) : 0;
  const computedTop = baseTop + sIndex * stackOffset;

  const computedZIndex = 10 + sIndex;

  const transformStyle = isHovered
    ? `translateY(-${sIndex * stackOffset + hoverExtra}px) scale(1.015)`
    : "translateY(0px) scale(1)";

  const cardStyle = {
    ...style,
    top: `${computedTop}px`,
    zIndex: computedZIndex,
    transform: transformStyle,
    ...(isHexColor
      ? {
          backgroundColor: event.color,
          borderLeft: `4px solid ${isDarkBg ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.2)"}`,
          borderColor: isDarkBg ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
        }
      : {}),
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={cardStyle}
      className={`absolute p-3.5 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:shadow-[0_8px_20px_rgba(0,0,0,0.03)] cursor-pointer overflow-hidden select-none ${
        isHexColor ? "border" : `${colorTheme.bg} ${colorTheme.border}`
      }`}
    >
      <div className="flex flex-col gap-1.5 h-full text-left justify-between">
        <h3 className={`text-[12.5px] font-extrabold leading-tight line-clamp-2 ${titleColor}`}>
          {event.title}
        </h3>

        <div className="flex flex-col gap-1 mt-auto">
          {lecturerName && (
            <div className={`flex items-center gap-1 text-[9.5px] font-semibold truncate ${metaColor}`}>
              <GraduationCap className={`w-3.5 h-3.5 flex-shrink-0 ${iconColor}`} />
              <span className="truncate">{lecturerName}</span>
            </div>
          )}

          {event.subtitle && (
            <div className={`flex items-center gap-1 text-[9.5px] font-bold truncate ${metaColor}`}>
              <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${iconColor}`} />
              <span className="truncate">{event.subtitle}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
