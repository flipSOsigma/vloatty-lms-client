import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  BarChart3,
  BookOpen,
  LogOut,
  Plus,
  ArrowRight,
  ChevronDown,
  Star
} from "lucide-react";
import { useLms } from "../../context/LmsContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const [isMinimized, setIsMinimized] = useState(false);
  const { logout, mobileSidebarOpen, setMobileSidebarOpen, currentUser } = useLms();

  // Close sidebar on navigation change on mobile
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname, setMobileSidebarOpen]);

  // Sync state with localStorage on client mount
  useEffect(() => {
    const saved = localStorage.getItem("sidebar_state");
    if (saved === "0") {
      setIsMinimized(true);
    }
  }, []);

  const handleToggle = () => {
    setIsMinimized((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar_state", next ? "0" : "1");
      return next;
    });
  };

  const menuItems = [
    { name: "Overview", icon: LayoutDashboard, href: "/dashboard", hasSub: true },
    { name: "Schedule", icon: Calendar, href: "/dashboard/schedule" },
    { name: "Subjects", icon: BookOpen, href: "/dashboard/subjects" },
  ];

  const pocketItems = [
    { name: "Create Subject", icon: Plus, href: "/dashboard/subject/create" },
    { name: "Statistics & reports", icon: BarChart3, href: "#" },
  ];

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 cursor-pointer"
        />
      )}

      <aside
        className={`bg-white text-zinc-500 p-6 flex flex-col justify-between select-none transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] border-r border-[#EFECE6]/70 z-50
          fixed inset-y-0 left-0 h-screen shadow-xl lg:shadow-none
          lg:static lg:flex lg:h-screen lg:m-0 rounded-none
          overflow-y-auto no-scrollbar
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-[300px] lg:translate-x-0"}
          ${isMinimized ? "w-[90px] px-4" : "w-[270px] px-6"}
        `}
      >
        <div className="flex flex-col gap-5">
          {/* Brand / Logo (Acting as minimized/expanded toggle) */}
          <div className="flex items-center mt-2 px-1.5 w-full">
            <button
              onClick={handleToggle}
              className={`flex items-center gap-2.5 transition-all duration-300 hover:scale-102 active:scale-98 cursor-pointer select-none text-left focus:outline-none w-full border-none bg-transparent p-0 ${
                isMinimized ? "justify-center" : ""
              }`}
              title={isMinimized ? "Expand Sidebar" : "Minimize Sidebar"}
            >
              <div className="relative flex-shrink-0 group">
                <img
                  src="/vloatty - Logo Only.png"
                  alt="Vloatty Logo"
                  className="w-7.5 h-7.5 object-contain transition-transform duration-500 group-hover:rotate-12 brightness-0"
                />
              </div>
              <span
                className={`text-[22px] font-black text-zinc-900 tracking-tight leading-none transition-all duration-300 whitespace-nowrap overflow-hidden ${
                  isMinimized ? "opacity-0 w-0 pointer-events-none" : "opacity-100 w-auto"
                }`}
              >
                Vloatty
              </span>
            </button>
          </div>

          {/* User Welcome Text */}
          {!isMinimized && (
            <div className="text-left px-1.5 mt-1 transition-all duration-300">
              <h2 className="text-[23px] font-black text-zinc-950 leading-tight tracking-tight">
                Welcome Back, <span className="block text-[#d97706] font-black">{currentUser?.name ? currentUser.name.split(" ")[0] : "Academic"}!</span>
              </h2>
              <p className="text-[10px] text-zinc-400 font-bold mt-1 uppercase tracking-wide leading-normal">
                academic portal
              </p>
            </div>
          )}

          {/* Home Nav */}
          <div className="flex flex-col gap-1.5 mt-2">
            <span
              className={`text-[9px] font-black text-zinc-400/80 tracking-widest uppercase px-3 transition-all duration-300 ${
                isMinimized ? "opacity-0 h-0 overflow-hidden" : "opacity-100"
              }`}
            >
              Home
            </span>
            <nav className="flex flex-col gap-1 mt-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href !== "#" &&
                  (pathname === item.href || (item.href === "/dashboard" && pathname === "/"));
                
                const content = (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 transition-all duration-200 group-hover:scale-110 ${
                          isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-900"
                        }`}
                      />
                      <span
                        className={`transition-all duration-300 whitespace-nowrap overflow-hidden font-bold ${
                          isMinimized
                            ? "opacity-0 w-0 pointer-events-none"
                            : "opacity-100 w-auto"
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                    {item.hasSub && !isMinimized && (
                      <div className="flex items-center gap-2">
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#facc15] shadow-[0_0_8px_rgba(250,204,21,0.9)] shrink-0" />
                        )}
                        <ChevronDown className={`w-3.5 h-3.5 transition-colors ${isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-900"}`} />
                      </div>
                    )}
                    {!item.hasSub && !isMinimized && isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#facc15] shadow-[0_0_8px_rgba(250,204,21,0.9)] shrink-0" />
                    )}
                  </>
                );

                const buttonClass = `w-full flex items-center justify-between rounded-full text-[13px] transition-all duration-250 cursor-pointer group hover:translate-x-0.5 ${
                  isActive
                    ? "text-white bg-[#121212] shadow-md shadow-zinc-800/10 font-bold"
                    : "text-zinc-500 hover:text-zinc-955 hover:bg-zinc-50/80 font-semibold"
                } ${isMinimized ? "justify-center px-0 py-3" : "px-4 py-2.5"}`;

                return (
                  <Link key={item.name} href={item.href} className={buttonClass}>
                    {content}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Pocket / Shortcuts Nav */}
          <div className="flex flex-col gap-1.5 mt-1">
            <span
              className={`text-[9px] font-black text-zinc-400/80 tracking-widest uppercase px-3 transition-all duration-300 ${
                isMinimized ? "opacity-0 h-0 overflow-hidden" : "opacity-100"
              }`}
            >
              Shortcuts
            </span>
            <nav className="flex flex-col gap-1 mt-1">
              {pocketItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                const content = (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 transition-all duration-200 group-hover:scale-110 ${
                          isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-900"
                        }`}
                      />
                      <span
                        className={`transition-all duration-300 whitespace-nowrap overflow-hidden font-bold ${
                          isMinimized
                            ? "opacity-0 w-0 pointer-events-none"
                            : "opacity-100 w-auto"
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                  </>
                );

                const buttonClass = `w-full flex items-center rounded-full text-[13px] transition-all duration-250 cursor-pointer group hover:translate-x-0.5 ${
                  isActive
                    ? "text-white bg-[#121212] shadow-md shadow-zinc-800/10 font-bold"
                    : "text-zinc-500 hover:text-zinc-955 hover:bg-zinc-50/80 font-semibold"
                } ${isMinimized ? "justify-center px-0 py-3" : "px-4 py-2.5"}`;

                if (item.href === "#") {
                  return (
                    <button key={item.name} className={buttonClass}>
                      {content}
                    </button>
                  );
                }

                return (
                  <Link key={item.name} href={item.href} className={buttonClass}>
                    {content}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Log Out */}
        <div className="pt-4 border-t border-zinc-100 w-full mt-auto">
          <button
            onClick={logout}
            className={`w-full flex items-center rounded-full text-[13px] font-bold hover:text-red-655 hover:bg-red-50 transition-all duration-200 cursor-pointer text-zinc-450 hover:translate-x-0.5 ${
              isMinimized ? "justify-center px-0 py-3" : "gap-3 px-4 py-2.5"
            }`}
          >
            <LogOut className="w-4.5 h-4.5 flex-shrink-0" />
            <span
              className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${
                isMinimized ? "opacity-0 w-0 pointer-events-none" : "opacity-100 w-auto"
              }`}
            >
              Log out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
