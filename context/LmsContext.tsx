"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { LmsEvent, CalendarViewType, LmsState, Subject } from "../types/lms";
import { ToastItem, ToastStyles } from "../components/ui/Toast";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  premiumStatus: "free" | "premium" | "professional";
  institution: string;
  avatar: string;
  banner?: string | null;
}

interface LmsContextType extends LmsState {
  subjects: Subject[];
  currentUser: UserProfile | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setSelectedView: (view: CalendarViewType) => void;
  setActiveDayIndex: (index: number) => void;
  setSearchQuery: (query: string) => void;
  toggleCategory: (category: string) => void;
  addEvent: (event: Omit<LmsEvent, "id" | "createdAt" | "updatedAt" | "deletedAt">) => void;
  deleteEvent: (id: string) => void;
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
  selectedEvent: LmsEvent | null;
  setSelectedEvent: (event: LmsEvent | null) => void;
  addSubject: (subject: Omit<Subject, "id" | "createdAt" | "updatedAt" | "deletedAt"> & { id?: string }) => void;
  deleteSubject: (id: string) => void;
  updateSubject: (subject: Subject) => void;
  refreshSubjects: () => Promise<void>;
  isLoadingUser: boolean;
  logout: () => void;
  showToast: (message: string, type?: "success" | "error") => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const LmsContext = createContext<LmsContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const LmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<LmsEvent[]>([]);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  const [toasts, setToasts] = useState<{ message: string; type: "success" | "error"; id: string }[]>([]);
  const showToast = React.useCallback((message: string, type: "success" | "error" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { message, type, id }]);
  }, []);

  const logout = async () => {
    try {
      const currentToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (currentToken) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${currentToken}` }
        });
      }
    } catch (err) {
      console.error("Logout API call failed:", err);
    } finally {
      localStorage.removeItem("token");
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      setCurrentUser(null);
      window.location.href = "/login";
    }
  };
  const [selectedView, setSelectedView] = useState<CalendarViewType>("week");
  const [activeDayIndex, setActiveDayIndex] = useState<number>(3);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState<string>("07:21");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<LmsEvent | null>(null);

  const generateSubjectEvents = (subj: Subject): LmsEvent[] => {
    const dayMap: { [key: string]: number } = {
      Monday: 0,
      Tuesday: 1,
      Wednesday: 2,
      Thursday: 3,
      Friday: 4,
      Saturday: 5,
      Sunday: 6
    };
    const loadedEvents: LmsEvent[] = [];
    if (subj.schedules) {
      subj.schedules.forEach((sch, idx) => {
        loadedEvents.push({
          id: `${subj.id}-${sch.day}-${idx}`,
          title: subj.name,
          subtitle: sch.room || subj.room || "",
          timeStart: sch.startTime,
          timeEnd: sch.endTime,
          dayIndex: dayMap[sch.day] !== undefined ? dayMap[sch.day] : 0,
          color: "pink",
          subjectId: subj.id,
          createdAt: subj.createdAt,
          updatedAt: subj.updatedAt,
          deletedAt: null
        });
      });
    }
    if (subj.modules) {
      subj.modules.forEach((mod) => {
        if (mod.date) {
          const d = new Date(mod.date);
          if (!isNaN(d.getTime())) {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const dateVal = String(d.getDate()).padStart(2, "0");
            const dateStr = `${year}-${month}-${dateVal}`;
            loadedEvents.push({
              id: `release-${mod.id}`,
              title: `[Release] ${mod.title}`,
              subtitle: subj.name,
              timeStart: "08:00",
              timeEnd: "09:00",
              dayIndex: -1,
              color: "pink",
              tag: {
                text: "Release",
                type: "pink"
              },
              description: mod.desc,
              subjectId: subj.id,
              createdAt: mod.createdAt || subj.createdAt,
              updatedAt: mod.updatedAt || subj.updatedAt,
              deletedAt: null,
              dateStr
            });
          }
        }
        if (mod.lessons) {
          mod.lessons.forEach((lesson) => {
            const now = new Date();
            const closeD = new Date(lesson.closeDate);
            const isPastDeadline = !isNaN(closeD.getTime()) && now > closeD;

            if (lesson.openDate && !isPastDeadline) {
              const openD = new Date(lesson.openDate);
              if (!isNaN(openD.getTime())) {
                const year = openD.getFullYear();
                const month = String(openD.getMonth() + 1).padStart(2, "0");
                const dateVal = String(openD.getDate()).padStart(2, "0");
                const dateStr = `${year}-${month}-${dateVal}`;
                loadedEvents.push({
                  id: `open-${lesson.id}`,
                  title: `[Open] ${lesson.title}`,
                  subtitle: subj.name,
                  timeStart: "09:00",
                  timeEnd: "10:00",
                  dayIndex: -1,
                  color: "pink",
                  tag: {
                    text: "Lesson",
                    type: "pink"
                  },
                  description: lesson.desc,
                  subjectId: subj.id,
                  createdAt: lesson.createdAt || subj.createdAt,
                  updatedAt: lesson.updatedAt || subj.updatedAt,
                  deletedAt: null,
                  dateStr
                });
              }
            }

            if (lesson.type !== "learning" && lesson.closeDate && !isPastDeadline) {
              const d = new Date(lesson.closeDate);
              if (!isNaN(d.getTime())) {
                let h = d.getHours();
                if (h < 7) h = 7;
                if (h >= 21) h = 20;
                const timeStart = `${String(h).padStart(2, "0")}:00`;
                const timeEnd = `${String(h + 1).padStart(2, "0")}:00`;
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const dateVal = String(d.getDate()).padStart(2, "0");
                const dateStr = `${year}-${month}-${dateVal}`;
                loadedEvents.push({
                  id: `deadline-${lesson.id}`,
                  title: `[Deadline] ${lesson.title}`,
                  subtitle: subj.name,
                  timeStart,
                  timeEnd,
                  dayIndex: -1,
                  color: "pink",
                  tag: {
                    text: "Deadline",
                    type: "pink"
                  },
                  description: lesson.desc,
                  subjectId: subj.id,
                  createdAt: lesson.createdAt || subj.createdAt,
                  updatedAt: lesson.updatedAt || subj.updatedAt,
                  deletedAt: null,
                  dateStr
                });
              }
            }
          });
        }
      });
    }
    return loadedEvents;
  };

  useEffect(() => {
    const processSubjects = (data: Subject[]) => {
      setSubjects(data);
      const loadedEvents: LmsEvent[] = [];
      data.forEach((subj) => {
        loadedEvents.push(...generateSubjectEvents(subj));
      });
      setEvents(loadedEvents);
    };

    fetch(`${API_BASE_URL}/subjects`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data: Subject[]) => {
        processSubjects(data);
      })
      .catch((err) => {
        console.error(err);
        fetch(`/data/subjects.json?t=${Date.now()}`, { cache: "no-store" })
          .then((res) => {
            if (!res.ok) {
              throw new Error("Failed to fetch subjects fallback");
            }
            return res.json();
          })
          .then((localData: Subject[]) => {
            processSubjects(localData);
          })
          .catch((localErr) => {
            console.error(localErr);
          });
      });
  }, []);

  useEffect(() => {
    let currentToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    
    const fetchUser = (tokenToUse: string | null) => {
      fetch(`${API_BASE_URL}/auth/me`, {
        cache: "no-store",
        headers: tokenToUse ? { "Authorization": `Bearer ${tokenToUse}` } : {}
      })
        .then((res) => {
          if (!res.ok) {
            const error = new Error("Failed to fetch user profile from server");
            (error as any).status = res.status;
            throw error;
          }
          return res.json();
        })
        .then((data) => {
          if (data) {
            setCurrentUser(data);
          }
          setIsLoadingUser(false);
        })
        .catch((err) => {
          if (err.status === 401 || err.status === 403) {
            console.warn("Session expired or invalid token:", err);
            localStorage.removeItem("token");
            document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            setCurrentUser(null);
            setIsLoadingUser(false);
            
            const path = typeof window !== "undefined" ? window.location.pathname : "";
            const isPublicPage = path === "/" || path === "/login" || path === "/register";
            
            if (typeof window !== "undefined") {
              if (!isPublicPage) {
                window.location.href = "/login?expired=true";
              } else if (path === "/") {
                showToast("Your session has expired. Please sign in again.", "error");
              }
            }
            return;
          }

          console.error("Error fetching user data in LMS Context, falling back to local mock data:", err);

          fetch(`/data/user.json?t=${Date.now()}`, { cache: "no-store" })
            .then((res) => res.json())
            .then((localData) => {
              if (localData.user) {
                setCurrentUser(localData.user);
              }
              setIsLoadingUser(false);
            })
            .catch((localErr) => {
              console.error("Error fetching fallback user data:", localErr);
              setIsLoadingUser(false);
            });
        });
    };

    if (currentToken) {
      fetchUser(currentToken);
    } else {
      setCurrentUser(null);
      setIsLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    const updateRealTimeAndDay = () => {
      const now = new Date();
      const currentHourMin = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      setCurrentTime(currentHourMin);

      const day = now.getDay();
      const todayIndex = day === 0 ? 6 : day - 1;
      setActiveDayIndex(todayIndex);
    };

    updateRealTimeAndDay();
    const timer = setInterval(updateRealTimeAndDay, 30000);

    return () => clearInterval(timer);
  }, []);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const addEvent = (eventData: Omit<LmsEvent, "id" | "createdAt" | "updatedAt" | "deletedAt">) => {
    const now = new Date().toISOString();
    const newEvent: LmsEvent = {
      ...eventData,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    setEvents((prev) => [...prev, newEvent]);
  };

  const deleteEvent = (id: string) => {
    const now = new Date().toISOString();
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, deletedAt: now } : e))
    );
    if (selectedEvent?.id === id) {
      setSelectedEvent(null);
    }
  };

  const addSubject = async (subjectData: Omit<Subject, "id" | "createdAt" | "updatedAt" | "deletedAt"> & { id?: string }) => {
    try {
      const currentToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch(`${API_BASE_URL}/subjects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(currentToken ? { "Authorization": `Bearer ${currentToken}` } : {})
        },
        body: JSON.stringify(subjectData),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          setCurrentUser(null);
          showToast("Your session has expired. Please sign in again.", "error");
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to add subject on the server");
      }

      const newSubject: Subject = await response.json();
      setSubjects((prev) => [...prev, newSubject]);

      setEvents((prev) => [...prev, ...generateSubjectEvents(newSubject)]);
      showToast("Subject added successfully!", "success");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to add subject", "error");
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      const currentToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch(`${API_BASE_URL}/subjects/${id}`, {
        method: "DELETE",
        headers: currentToken ? { "Authorization": `Bearer ${currentToken}` } : {}
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          setCurrentUser(null);
          showToast("Your session has expired. Please sign in again.", "error");
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete subject on the server");
      }

      const now = new Date().toISOString();
      setSubjects((prev) =>
        prev.map((s) => (s.id === id ? { ...s, deletedAt: now } : s))
      );
      setEvents((prev) =>
        prev.map((e) => (e.subjectId === id ? { ...e, deletedAt: now } : e))
      );
      showToast("Subject deleted successfully!", "success");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to delete subject", "error");
    }
  };

  const updateSubject = async (updatedSubject: Subject) => {
    try {
      const currentToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch(`${API_BASE_URL}/subjects/${updatedSubject.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(currentToken ? { "Authorization": `Bearer ${currentToken}` } : {})
        },
        body: JSON.stringify(updatedSubject),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          setCurrentUser(null);
          showToast("Your session has expired. Please sign in again.", "error");
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update subject on the server");
      }

      const savedSubject: Subject = await response.json();
      setSubjects((prev) =>
        prev.map((s) => (s.id === savedSubject.id ? savedSubject : s))
      );

      setEvents((prev) => {
        const remainingEvents = prev.filter((e) => e.subjectId !== savedSubject.id);
        return [...remainingEvents, ...generateSubjectEvents(savedSubject)];
      });
      showToast("Subject details updated successfully!", "success");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to update subject", "error");
    }
  };

  const refreshSubjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects`, { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
        const loadedEvents: LmsEvent[] = [];
        data.forEach((subj: Subject) => {
          loadedEvents.push(...generateSubjectEvents(subj));
        });
        setEvents(loadedEvents);
      }
    } catch (err) {
      console.error("Error refreshing subjects in context:", err);
    }
  };

  const activeSubjects = subjects.filter((s) => !s.deletedAt);
  const activeEvents = events.filter((e) => {
    if (e.deletedAt) return false;
    if (e.subjectId) {
      return activeSubjects.some((s) => s.id === e.subjectId);
    }
    return true;
  });

  return (
    <LmsContext.Provider
      value={{
        subjects: activeSubjects,
        currentUser,
        setCurrentUser,
        events: activeEvents,
        selectedView,
        activeDayIndex,
        searchQuery,
        selectedCategories,
        currentTime,
        showAddModal,
        setShowAddModal,
        selectedEvent,
        setSelectedEvent,
        setSelectedView,
        setActiveDayIndex,
        setSearchQuery,
        toggleCategory,
        addEvent,
        deleteEvent,
        addSubject,
        deleteSubject,
        updateSubject,
        refreshSubjects,
        isLoadingUser,
        logout,
        showToast,
        mobileSidebarOpen,
        setMobileSidebarOpen,
      }}
    >
      {children}
      <ToastStyles />
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <ToastItem
            key={t.id}
            id={t.id}
            message={t.message}
            type={t.type}
            onRemove={(id) => setToasts((prev) => prev.filter((to) => to.id !== id))}
          />
        ))}
      </div>
    </LmsContext.Provider>
  );
};

export const useLms = () => {
  const context = useContext(LmsContext);
  if (!context) {
    throw new Error("useLms must be used within a LmsProvider");
  }
  return context;
};
