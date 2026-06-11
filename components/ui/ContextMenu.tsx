"use client";

import React, { useEffect, useRef } from "react";

interface ContextMenuOption {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  danger?: boolean;
}

interface ContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  x: number;
  y: number;
  options: ContextMenuOption[];
}

export default function ContextMenu({ isOpen, onClose, x, y, options }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[998] bg-transparent"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onClose();
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
      />
      
      <div
        ref={menuRef}
        className="fixed bg-[#FAF7F2]/95 backdrop-blur-md border border-[#E5E1D8] rounded-2xl p-1.5 shadow-xl z-[999] w-44 text-left flex flex-col gap-0.5 origin-top-left animate-in fade-in zoom-in-95 duration-100"
        style={{
          left: `${x}px`,
          top: `${y}px`,
        }}
      >
        {options.map((opt, idx) => {
          const Icon = opt.icon;
          return (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                opt.onClick();
                onClose();
              }}
              className={`flex items-center gap-2 px-2.5 py-2 hover:bg-zinc-200/40 rounded-xl text-[11.5px] font-medium transition-all duration-200 cursor-pointer w-full text-left ${
                opt.danger ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50/50" : "text-zinc-700"
              }`}
            >
              {Icon && <Icon className={`w-3.5 h-3.5 ${opt.danger ? "text-rose-500" : "text-zinc-400"}`} />}
              {opt.label}
            </button>
          );
        })}
      </div>
    </>
  );
}
