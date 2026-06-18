"use client";

import React from "react";

interface UserAvatarProps {
  name: string;
  avatar?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  xs: { container: "w-5 h-5", text: "text-[8.5px]" },
  sm: { container: "w-6 h-6", text: "text-[9px]" },
  md: { container: "w-8 h-8", text: "text-[11px]" },
  lg: { container: "w-10 h-10", text: "text-[13px]" },
};

/**
 * Displays a user avatar image or a colored initials fallback.
 */
export default function UserAvatar({
  name,
  avatar,
  size = "sm",
  className = "",
}: UserAvatarProps) {
  const { container, text } = sizeMap[size];
  const initials = name.slice(0, 2).toUpperCase();

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`${container} rounded-full object-cover border border-zinc-200 flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${container} rounded-full bg-[#facc15]/10 text-[#d97706] flex items-center justify-center font-bold flex-shrink-0 ${text} ${className}`}
    >
      {initials}
    </div>
  );
}
