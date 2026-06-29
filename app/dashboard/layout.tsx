"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLms } from "../../context/LmsContext";
import Sidebar from "../../components/views/Sidebar";
import Link from "next/link";
import { Library, LayoutDashboard, Calendar, BookOpen, HardDrive } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isLoadingUser } = useLms();

  const navItems = [
    { name: "Overview", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Schedule", icon: Calendar, href: "/dashboard/schedule" },
    { name: "Subjects", icon: BookOpen, href: "/dashboard/subjects" },
    { name: "Storage", icon: HardDrive, href: "/dashboard/storage" },
  ];

  useEffect(() => {
    if (!isLoadingUser && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, isLoadingUser, router]);

  if (isLoadingUser) {
    return (
      <div className="min-h-screen w-screen bg-[#FAF7F2] flex flex-col items-center justify-center gap-4 select-none">
        <div className="w-12 h-12 rounded-2xl bg-[#facc15]/10 flex items-center justify-center animate-pulse">
          <Library className="w-6 h-6 text-[#d97706]" />
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

      {/* Shared Main Content Panel container (with extra bottom padding for bottom nav on mobile) */}
      <main className="flex-1 flex flex-col p-2 pb-24 lg:p-4 lg:pb-4 lg:pl-0 h-full min-w-0 overflow-hidden">
        <div className="flex-1 flex flex-col bg-[#FAF7F2] rounded-3xl px-3 md:px-6 gap-4 h-full overflow-hidden border border-[#EFECE6]/20">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar styled like ref.jpg */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40 animate-in slide-in-from-bottom duration-300">
        <nav className="relative bg-white border border-zinc-200/55 rounded-[24px] px-2 h-16 flex items-center justify-between shadow-lg">
          {(() => {
            const getActiveTabIndex = () => {
              if (pathname.startsWith("/dashboard/schedule")) return 1;
              if (pathname.startsWith("/dashboard/subjects") || pathname.startsWith("/dashboard/subject")) return 2;
              if (pathname.startsWith("/dashboard/storage")) return 3;
              return 0;
            };
            const activeIndex = getActiveTabIndex();
            const ActiveIcon = navItems[activeIndex].icon;

            return (
              <>
                {/* Sliding Circular Indicator */}
                <div 
                  className="absolute top-[-22px] w-14 h-14 rounded-full bg-gradient-to-br from-[#facc15] to-[#d97706] border-4 border-[#FAF7F2] flex items-center justify-center shadow-lg shadow-[#d97706]/30 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] z-10"
                  style={{
                    left: `calc(${(activeIndex * 100) / 4}% + (100% / 4 - 56px) / 2)`,
                  }}
                >
                  <ActiveIcon 
                    key={activeIndex} 
                    className="w-5.5 h-5.5 text-white animate-in zoom-in-75 duration-200" 
                  />
                </div>

                {navItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = idx === activeIndex;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex-1 flex flex-col items-center justify-center h-full w-full py-1 text-zinc-400 transition-colors z-20 relative select-none"
                    >
                      <Icon 
                        className={`w-5 h-5 transition-all duration-300 ${
                          isActive 
                            ? "opacity-0 scale-50 -translate-y-4" 
                            : "opacity-100 scale-100 text-zinc-400 hover:text-zinc-650"
                        }`} 
                      />
                      <span 
                        className={`text-[10px] tracking-tight transition-all duration-300 ${
                          isActive 
                            ? "text-[#d97706] font-extrabold translate-y-1.5" 
                            : "text-zinc-400 font-semibold"
                        }`}
                      >
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </>
            );
          })()}
        </nav>
      </div>
    </div>
  );
}
