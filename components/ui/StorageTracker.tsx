"use client";

import React, { useState, useEffect } from "react";
import { HardDrive } from "lucide-react";

interface StorageTrackerProps {
  institutionId: string;
}

interface StorageData {
  usedBytes: number;
  maxBytes: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const StorageTracker: React.FC<StorageTrackerProps> = ({ institutionId }) => {
  const [data, setData] = useState<StorageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!institutionId) return;

    const fetchStorage = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = token ? { "Authorization": `Bearer ${token}` } : {};
        const res = await fetch(`${API_BASE_URL}/institutions/${institutionId}/storage`, { headers });
        if (res.ok) {
          const storageData = await res.json();
          setData(storageData);
        }
      } catch (err) {
        console.error("Error fetching storage data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStorage();
  }, [institutionId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-4 bg-white border border-[#E5E1D8] rounded-2xl animate-pulse">
        <div className="h-4 bg-zinc-100 rounded w-1/3"></div>
        <div className="h-2 bg-zinc-100 rounded w-full"></div>
      </div>
    );
  }

  if (!data) return null;

  const usedMb = data.usedBytes / (1024 * 1024);
  const maxMb = data.maxBytes / (1024 * 1024);
  const percentage = Math.min(100, (usedMb / maxMb) * 100);

  // Determine indicator colors based on usage density
  let barColor = "bg-[#facc15]"; // Pink default
  let textColor = "text-[#d97706]";
  let bgTint = "bg-[#facc15]/10";

  if (percentage >= 90) {
    barColor = "bg-rose-500";
    textColor = "text-rose-600";
    bgTint = "bg-rose-50";
  } else if (percentage >= 75) {
    barColor = "bg-amber-500";
    textColor = "text-amber-600";
    bgTint = "bg-amber-50";
  }

  return (
    <div className="flex flex-col gap-3 p-5 bg-white border border-zinc-200/80 rounded-2xl shadow-sm w-full max-w-sm text-left">
      <div className="flex items-center gap-2 text-zinc-700">
        <HardDrive className="w-4 h-4 text-zinc-500" />
        <span className="text-[12px] font-extrabold tracking-tight uppercase">Institution Storage Used</span>
      </div>

      <div className="w-full h-2 rounded-full bg-zinc-150 overflow-hidden">
        <div 
          className={`h-full ${barColor} rounded-full transition-all duration-300`} 
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-[11px] font-bold">
        <span className="text-zinc-500">
          {usedMb.toFixed(2)} MB of {maxMb.toFixed(0)} MB
        </span>
        <span className={`px-2 py-0.5 rounded-full ${bgTint} ${textColor} text-[10px]`}>
          {percentage.toFixed(1)}% Used
        </span>
      </div>
    </div>
  );
};
