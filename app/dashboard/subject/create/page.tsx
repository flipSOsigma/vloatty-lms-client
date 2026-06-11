"use client";

import React, { useState, useEffect } from "react";
import Header from "../../../../components/views/Header";
import { useLms } from "../../../../context/LmsContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  Check,
  Calendar,
  Users,
  MapPin,
  Settings,
  Search,
  X,
  BookOpen,
} from "lucide-react";
import facultyMockRaw from "../../../../public/data/users.json";
const facultyMock = facultyMockRaw as Record<string, string>;

interface FormLecturer {
  email: string;
  name: string;
}

interface FormSchedule {
  day: string;
  startTime: string;
  endTime: string;
  room: string;
}

interface FormModule {
  title: string;
  desc: string;
}

export default function CreateSubjectPage() {
  const { addSubject, currentUser } = useLms();
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [room, setRoom] = useState("");
  const [color, setColor] = useState("#f25c88");

  const [lecturers, setLecturers] = useState<FormLecturer[]>([{ email: "", name: "" }]);
  const [schedules, setSchedules] = useState<FormSchedule[]>([
    { day: "Monday", startTime: "09:00", endTime: "10:40", room: "" },
  ]);
  const [modules, setModules] = useState<FormModule[]>([]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isLecturerModalOpen, setIsLecturerModalOpen] = useState(false);
  const [lecturerSearchQuery, setLecturerSearchQuery] = useState("");

  const hexToRgba = (hex: string, opacity: number) => {
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

  const [availableUsers, setAvailableUsers] = useState<{ name: string; email: string }[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/users`, {
          headers: {
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          },
        });
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((u: any) => ({ name: u.name, email: u.email }));
          setAvailableUsers(mapped);
          return;
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
      setAvailableUsers(Object.entries(facultyMock).map(([email, name]) => ({ email, name })));
    };
    fetchUsers();
  }, []);

  const allFiltered = availableUsers
    .filter((faculty) => {
      const isAlreadyAdded = lecturers.some(
        (l) => l.email.toLowerCase() === faculty.email.toLowerCase()
      );
      if (isAlreadyAdded) return false;

      const q = lecturerSearchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        faculty.name.toLowerCase().includes(q) ||
        faculty.email.toLowerCase().includes(q)
      );
    });

  const filteredSuggestions = lecturerSearchQuery.toLowerCase().trim()
    ? allFiltered
    : allFiltered.slice(0, 5);

  const handleSelectLecturer = (selected: { name: string; email: string }) => {
    setLecturers((prev) => {
      if (prev.length === 1 && !prev[0].email && !prev[0].name) {
        return [selected];
      }
      return [...prev, selected];
    });
    setIsLecturerModalOpen(false);
    setLecturerSearchQuery("");
  };

  const handleLecturerEmailChange = (index: number, emailValue: string) => {
    setLecturers((prev) => {
      const copy = [...prev];
      copy[index].email = emailValue;

      const cleanEmail = emailValue.trim().toLowerCase();
      const dbUser = availableUsers.find((u) => u.email.toLowerCase() === cleanEmail);
      if (dbUser) {
        copy[index].name = dbUser.name;
      } else if (facultyMock[cleanEmail]) {
        copy[index].name = facultyMock[cleanEmail];
      } else if (cleanEmail.includes("@")) {
        const partBeforeAt = cleanEmail.split("@")[0];
        const resolvedName = partBeforeAt
          .split(".")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        copy[index].name = resolvedName;
      } else {
        copy[index].name = "";
      }
      return copy;
    });
  };

  const handleLecturerNameChange = (index: number, nameValue: string) => {
    setLecturers((prev) => {
      const copy = [...prev];
      copy[index].name = nameValue;
      return copy;
    });
  };

  const handleScheduleChange = (
    index: number,
    field: keyof FormSchedule,
    value: string
  ) => {
    setSchedules((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddModule = () => {
    setModules((prev) => [...prev, { title: "", desc: "" }]);
  };

  const handleRemoveModule = (index: number) => {
    setModules((prev) => prev.filter((_, i) => i !== index));
  };

  const handleModuleChange = (
    index: number,
    field: keyof FormModule,
    value: string
  ) => {
    setModules((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = "Subject name is required.";
    }

    const validLecturers = lecturers.filter(
      (l) => l.email.trim() !== "" && l.name.trim() !== ""
    );
    if (validLecturers.length === 0) {
      newErrors.lecturers = "At least one lecturer with email and display name is required.";
    }

    schedules.forEach((sch, idx) => {
      if (!sch.startTime || !sch.endTime) {
        newErrors.schedules = "All schedule rows must have start and end times.";
      } else if (sch.startTime >= sch.endTime) {
        newErrors.schedules = "Start time must be earlier than end time.";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    const mappedLecturers = lecturers
      .filter((l) => l.email.trim() !== "" && l.name.trim() !== "")
      .map((l) => ({
        userId: `u_lecturer_${Math.random().toString(36).substring(2, 9)}`,
        name: l.name.trim(),
        email: l.email.trim(),
      }));

    const mappedSchedules = schedules.map((sch) => ({
      day: sch.day,
      startTime: sch.startTime,
      endTime: sch.endTime,
      room: sch.room.trim() || room.trim() || "Online Classroom",
    }));

    const mappedModules = modules
      .filter((m) => m.title.trim() !== "")
      .map((m) => {
        const mId = typeof window !== "undefined" && window.crypto && window.crypto.randomUUID
          ? window.crypto.randomUUID()
          : Math.random().toString(36).substring(2, 9);
        return {
          id: mId,
          title: m.title.trim(),
          desc: m.desc.trim(),
          date: new Date().toISOString(),
          lessons: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        };
      });

    setTimeout(() => {
      addSubject({
        name: name.trim(),
        description: description.trim(),
        room: room.trim() || "Online Classroom",
        color,
        lecturers: mappedLecturers,
        schedules: mappedSchedules,
        modules: mappedModules,
        createdBy: currentUser?.id || "c9c15c47-469a-412f-8431-21568eaf35d4",
        deletedBy: null,
      });

      setIsSubmitting(false);
      router.push("/dashboard");
    }, 800);
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <>
      <Header />

      <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-4 flex flex-col gap-6 text-left select-none w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-full border border-[#E5E1D8] flex items-center justify-center text-zinc-600 hover:bg-white hover:border-zinc-400 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-[#121212] tracking-tight">
              Create New Subject
            </h1>
            <p className="text-[12px] text-zinc-500 font-medium">
              Create a new educational course card, define schedules, and add modules.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full">
          <div className="flex flex-col gap-5 w-full mb-8 pl-12">
            <h3 className="text-[14.5px] font-bold text-[#121212] flex items-center gap-2 pb-2 border-b border-zinc-200">
              <Settings className="w-4.5 h-4.5 text-[#f25c88]" />
              Basic Parameters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-zinc-600">Subject Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Artificial Intelligence & Neural Networks"
                    className={`w-full px-4 py-3 rounded-2xl border text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-[#f25c88]/20 focus:border-[#f25c88] transition-all duration-200 ${
                      errors.name ? "border-red-400" : "border-zinc-200"
                    }`}
                  />
                  {errors.name && (
                    <span className="text-[11px] text-red-500 font-bold">{errors.name}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-zinc-600">Course Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write a brief overview of what this subject covers..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-2xl border border-zinc-200 text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-[#f25c88]/20 focus:border-[#f25c88] transition-all duration-200 resize-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-zinc-600">Default Classroom Location</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      placeholder="e.g. West Campus, Lab 402"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-zinc-200 text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-[#f25c88]/20 focus:border-[#f25c88] transition-all duration-200"
                    />
                    <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-zinc-600">Theme Color (Wheel Picker)</label>
                  <div className="flex items-center gap-3 bg-white border border-zinc-200 p-3 rounded-2xl">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-10 h-11 rounded-xl cursor-pointer overflow-hidden bg-transparent"
                    />
                    <div className="flex flex-col select-none min-w-0">
                      <span className="text-[12.5px] font-extrabold text-zinc-800 uppercase tracking-wider">{color}</span>
                      <span className="text-[9px] text-zinc-400 font-bold leading-tight">Click block to pick color</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full mb-8 pl-12">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <h3 className="text-[14.5px] font-bold text-[#121212] flex items-center gap-2">
                <Users className="w-4.5 h-4.5 text-[#f25c88]" />
                Lecturers *
              </h3>
              <button
                type="button"
                onClick={() => {
                  setLecturerSearchQuery("");
                  setIsLecturerModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4.5 py-2 rounded-full border border-zinc-200 bg-white hover:bg-[#FAF9F5] hover:border-zinc-400 text-[11px] font-bold text-zinc-700 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Lecturer
              </button>
            </div>

            {errors.lecturers && (
              <span className="text-[11px] text-red-500 font-bold">{errors.lecturers}</span>
            )}

            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-zinc-200">
                    <th className="pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider w-16">Avatar</th>
                    <th className="pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Email Address</th>
                    <th className="pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Display Name</th>
                    <th className="pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider w-16 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100/55">
                  {lecturers.map((lecturer, idx) => {
                    const initials = lecturer.name
                      ? lecturer.name.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase()
                      : "?";

                    return (
                      <tr key={idx} className="hover:bg-zinc-50/10 transition-colors">
                        <td className="py-3 pr-2">
                          <div
                            className="flex items-center justify-center w-8.5 h-8.5 rounded-full text-[10.5px] font-black border"
                            style={{
                              backgroundColor: hexToRgba(color, 0.08),
                              color: color,
                              borderColor: hexToRgba(color, 0.12)
                            }}
                          >
                            {initials}
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <input
                            type="email"
                            placeholder="e.g. olivia@vloatty.edu"
                            value={lecturer.email}
                            onChange={(e) => handleLecturerEmailChange(idx, e.target.value)}
                            className="w-full px-1 py-2 bg-transparent border-b border-zinc-200 focus:outline-none text-[13px] font-medium placeholder-zinc-400/50 transition-colors duration-200"
                            onFocus={(e) => {
                              e.target.style.borderColor = color;
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = "";
                            }}
                          />
                        </td>
                        <td className="py-3 pr-4">
                          <input
                            type="text"
                            placeholder="Resolved name or custom"
                            value={lecturer.name}
                            onChange={(e) => handleLecturerNameChange(idx, e.target.value)}
                            className="w-full px-1 py-2 bg-transparent border-b border-zinc-200 focus:outline-none text-[13px] font-medium placeholder-zinc-400/50 transition-colors duration-200"
                            onFocus={(e) => {
                              e.target.style.borderColor = color;
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = "";
                            }}
                          />
                        </td>
                        <td className="py-3 text-right">
                          {lecturers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setLecturers((prev) => prev.filter((_, i) => i !== idx))}
                              className="p-2 text-zinc-400 hover:text-rose-600 transition-colors duration-200 cursor-pointer inline-flex items-center justify-center active:scale-95"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full mb-8 pl-12">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <h3 className="text-[14.5px] font-bold text-[#121212] flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-[#f25c88]" />
                Schedules
              </h3>
              <button
                type="button"
                onClick={() => setSchedules((prev) => [...prev, { day: "Monday", startTime: "09:00", endTime: "10:40", room: "" }])}
                className="flex items-center gap-1.5 px-4.5 py-2 rounded-full border border-zinc-200 bg-white hover:bg-[#FAF9F5] hover:border-zinc-400 text-[11px] font-bold text-zinc-700 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Time
              </button>
            </div>

            {errors.schedules && (
              <span className="text-[11px] text-red-500 font-bold">{errors.schedules}</span>
            )}

            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-zinc-200">
                    <th className="pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Day of Week</th>
                    <th className="pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Start Time</th>
                    <th className="pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">End Time</th>
                    <th className="pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Classroom Location</th>
                    <th className="pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider w-16 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100/55">
                  {schedules.map((schedule, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/10 transition-colors">
                      <td className="py-3 pr-4 w-[200px]">
                        <select
                          value={schedule.day}
                          onChange={(e) => handleScheduleChange(idx, "day", e.target.value)}
                          className="w-full px-1 py-2 bg-transparent border-b border-zinc-200 focus:outline-none text-[13px] font-semibold transition-colors duration-200 cursor-pointer"
                          onFocus={(e) => {
                            e.target.style.borderColor = color;
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "";
                          }}
                        >
                          {daysOfWeek.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 pr-4 w-[130px]">
                        <input
                          type="time"
                          value={schedule.startTime}
                          onChange={(e) => handleScheduleChange(idx, "startTime", e.target.value)}
                          className="w-full px-1 py-2 bg-transparent border-b border-zinc-200 focus:outline-none text-[13px] font-semibold transition-colors duration-200"
                          onFocus={(e) => {
                            e.target.style.borderColor = color;
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "";
                          }}
                        />
                      </td>
                      <td className="py-3 pr-4 w-[130px]">
                        <input
                          type="time"
                          value={schedule.endTime}
                          onChange={(e) => handleScheduleChange(idx, "endTime", e.target.value)}
                          className="w-full px-1 py-2 bg-transparent border-b border-zinc-200 focus:outline-none text-[13px] font-semibold transition-colors duration-200"
                          onFocus={(e) => {
                            e.target.style.borderColor = color;
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "";
                          }}
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <input
                          type="text"
                          placeholder="Inherit default location"
                          value={schedule.room}
                          onChange={(e) => handleScheduleChange(idx, "room", e.target.value)}
                          className="w-full px-1 py-2 bg-transparent border-b border-zinc-200 focus:outline-none text-[13px] font-medium placeholder-zinc-400/50 transition-colors duration-200"
                          onFocus={(e) => {
                            e.target.style.borderColor = color;
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "";
                          }}
                        />
                      </td>
                      <td className="py-3 text-right">
                        {schedules.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setSchedules((prev) => prev.filter((_, i) => i !== idx))}
                            className="p-2 text-zinc-400 hover:text-rose-600 transition-colors duration-200 cursor-pointer inline-flex items-center justify-center active:scale-95"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full mb-8 pl-12">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <h3 className="text-[14.5px] font-bold text-[#121212] flex items-center gap-2">
                <BookOpen className="w-4.5 h-4.5 text-[#f25c88]" />
                Course Modules (Optional)
              </h3>
              <button
                type="button"
                onClick={handleAddModule}
                className="flex items-center gap-1.5 px-4.5 py-2 rounded-full border border-zinc-200 bg-white hover:bg-[#FAF9F5] hover:border-zinc-400 text-[11px] font-bold text-zinc-700 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Module
              </button>
            </div>

            {modules.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-[#E5E1D8] rounded-2xl bg-white/40">
                <p className="text-[12.5px] text-zinc-400 font-medium">No initial modules added. You can create them later.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 w-full">
                {modules.map((mod, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-3 border border-zinc-200 p-5 rounded-2xl bg-white relative animate-in slide-in-from-top-2 duration-200"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveModule(idx)}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-rose-600 hover:bg-zinc-50 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex flex-col gap-1.5 w-[92%]">
                      <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Module Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Module 1: Foundations of Artificial Intelligence"
                        value={mod.title}
                        onChange={(e) => handleModuleChange(idx, "title", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#f25c88]/20 focus:border-[#f25c88] transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 w-full">
                      <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Module Summary</label>
                      <input
                        type="text"
                        placeholder="e.g. Learning key terminology, basic heuristics search, and histories."
                        value={mod.desc}
                        onChange={(e) => handleModuleChange(idx, "desc", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#f25c88]/20 focus:border-[#f25c88] transition-all"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 justify-end pt-6 border-t border-zinc-200 mt-4">
            <Link
              href="/dashboard"
              className="px-6 py-2.5 border border-zinc-200 text-zinc-700 hover:text-[#121212] hover:border-zinc-400 font-bold rounded-full text-[12px] bg-white hover:bg-[#FAF9F5] transition-all cursor-pointer active:scale-[0.98]"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-[#121212] hover:bg-zinc-800 text-white font-bold rounded-full text-[12px] shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Create Subject
            </button>
          </div>
        </form>
      </div>

      {isLecturerModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#E5E1D8] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-extrabold text-[#121212] tracking-tight">Add Lecturer</h3>
                <p className="text-[11px] text-zinc-400 font-medium">Search faculty members by name or email</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsLecturerModalOpen(false);
                  setLecturerSearchQuery("");
                }}
                className="w-8 h-8 rounded-full border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 border-b border-zinc-100 bg-zinc-50/30">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={lecturerSearchQuery}
                  onChange={(e) => setLecturerSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-zinc-200 bg-white text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[#f25c88]/20 focus:border-[#f25c88] transition-all"
                  autoFocus
                />
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 min-h-[220px] max-h-[380px] flex flex-col gap-1.5 no-scrollbar">
              {filteredSuggestions.length > 0 ? (
                filteredSuggestions.map((faculty) => {
                  const initials = faculty.name
                    ? faculty.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                    : "?";
                  return (
                    <button
                      key={faculty.email}
                      type="button"
                      onClick={() => handleSelectLecturer(faculty)}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-zinc-50 text-left transition-all group active:scale-[0.99] cursor-pointer"
                    >
                      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#f25c88]/10 border border-[#f25c88]/15 text-[#f25c88] text-[11px] font-black group-hover:bg-[#f25c88]/20 transition-colors">
                        {initials}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-[13px] font-bold text-zinc-800 group-hover:text-[#121212] truncate">
                          {faculty.name}
                        </span>
                        <span className="text-[11px] text-zinc-400 font-medium truncate">
                          {faculty.email}
                        </span>
                      </div>
                      <Plus className="w-4 h-4 text-zinc-300 group-hover:text-[#f25c88] transition-colors mr-1" />
                    </button>
                  );
                })
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-8 text-center px-4">
                  <Search className="w-8 h-8 text-zinc-300 mb-2" />
                  <span className="text-[12.5px] font-bold text-zinc-600">No suggestions found</span>
                  <p className="text-[11px] text-zinc-400 mt-1 max-w-[240px] font-medium">
                    No faculty matches "{lecturerSearchQuery}".
                  </p>
                  {lecturerSearchQuery.trim().length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const query = lecturerSearchQuery.trim();
                        let email = "";
                        let name = "";
                        if (query.includes("@")) {
                          email = query;
                          const partBeforeAt = query.split("@")[0];
                          name = partBeforeAt
                            .split(".")
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ");
                        } else {
                          name = query;
                          email = `${query.toLowerCase().replace(/\s+/g, ".")}@vloatty.edu`;
                        }
                        handleSelectLecturer({ name, email });
                      }}
                      className="mt-4 px-4 py-2 border border-dashed border-[#f25c88]/40 hover:border-[#f25c88] text-[#f25c88] rounded-full text-[11px] font-bold bg-[#f25c88]/5 hover:bg-[#f25c88]/10 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add "{lecturerSearchQuery.trim()}" custom
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
