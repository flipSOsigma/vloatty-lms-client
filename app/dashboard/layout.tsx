"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLms } from "../../context/LmsContext";
import Sidebar from "../../components/views/Sidebar";
import { Library } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { currentUser, isLoadingUser } = useLms();

  useEffect(() => {
    if (!isLoadingUser && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, isLoadingUser, router]);

  if (isLoadingUser) {
    return (
      <div className="min-h-screen w-screen bg-[#FAF7F2] flex flex-col items-center justify-center gap-4 select-none">
        <div className="w-12 h-12 rounded-2xl bg-[#f25c88]/10 flex items-center justify-center animate-pulse">
          <Library className="w-6 h-6 text-[#f25c88]" />
        </div>
        <p className="text-[12px] text-zinc-500 font-bold tracking-tight">
          Synchronizing portal profile...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return null; // Prevents layout flash before redirect
  }

  return (
    <div className="flex h-screen w-screen bg-[#FAF7F2] overflow-hidden">
      {/* Shared Sidebar */}
      <Sidebar />

      {/* Shared Main Content Panel container */}
      <main className="flex-1 flex flex-col p-4 lg:pl-0 h-full min-w-0 overflow-hidden">
        <div className="flex-1 flex flex-col bg-[#FAF7F2] rounded-3xl px-4 md:px-6 gap-6 h-full overflow-hidden border border-[#EFECE6]/20">
          {children}
        </div>
      </main>
    </div>
  );
}
