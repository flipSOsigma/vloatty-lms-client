"use client";

import React, { useState, useEffect } from "react";
import Header from "../../../../../components/views/Header";
import { useLms } from "../../../../../context/LmsContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ConfirmModal from "../../../../../components/ui/ConfirmModal";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  Check,
  AlertTriangle,
  Calendar,
  Users,
  MapPin,
  Clock,
  Settings,
  Search,
  X,
  Link as LinkIcon,
  Mail,
  Globe,
} from "lucide-react";
import facultyMockRaw from "../../../../../public/data/users.json";
const facultyMock = facultyMockRaw as Record<string, string>;

interface PageProps {
  params: Promise<{ id: string }>;
}

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



export default function ManageSubjectPage({ params }: PageProps) {
  const { id } = React.use(params);
  const { subjects, currentUser, updateSubject, deleteSubject, showToast } = useLms();
  const router = useRouter();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState("Lecture");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleDeleteSubject = async () => {
    setIsDeleting(true);
    try {
      await deleteSubject(id);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

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


  const subject = subjects.find((s) => s.id === id);


  const [subjectName, setSubjectName] = useState("");
  const [subjectDesc, setSubjectDesc] = useState("");
  const [subjectRoom, setSubjectRoom] = useState("");
  const [subjectColor, setSubjectColor] = useState("#f25c88");
  const [subjectLecturers, setSubjectLecturers] = useState<FormLecturer[]>([]);
  const [subjectSchedules, setSubjectSchedules] = useState<FormSchedule[]>([]);


  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorFields, setErrorFields] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  const [isLecturerModalOpen, setIsLecturerModalOpen] = useState(false);
  const [lecturerSearchQuery, setLecturerSearchQuery] = useState("");
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
      const isAlreadyAdded = subjectLecturers.some(
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
    setSubjectLecturers((prev) => [...prev, selected]);
    setIsLecturerModalOpen(false);
    setLecturerSearchQuery("");
  };


  useEffect(() => {
    if (subject) {
      setSubjectName(subject.name);
      setSubjectDesc(subject.description || "");
      setSubjectRoom(subject.room || "");
      setSubjectColor(subject.color && subject.color.startsWith("#") ? subject.color : "#f25c88");
      setSubjectLecturers(subject.lecturers.map((l) => ({ email: l.email || "", name: l.name })));
      setSubjectSchedules(
        subject.schedules ? subject.schedules.map((s) => ({ ...s, room: s.room || "" })) : []
      );
      setIsOpen(subject.isOpen ?? false);
      setCategory(subject.category ?? "Lecture");
    }
  }, [subject]);

  const isOwner = subject && currentUser && subject.createdBy === currentUser.id;

  if (!subject) {
    return (
      <div className="flex flex-col gap-6 text-left animate-in fade-in duration-300">
        <Header />
        <div className="w-full h-64 flex flex-col items-center justify-center border border-dashed border-[#E5E1D8] rounded-3xl p-6 bg-white/40 select-none">
          <span className="text-[14px] text-zinc-400 font-semibold">Subject not found.</span>
          <Link
            href="/dashboard"
            className="mt-4 px-5 py-2.5 bg-[#121212] text-white font-bold rounded-full text-[12px] hover:bg-zinc-800 transition-all shadow-sm"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="flex flex-col gap-6 text-left animate-in fade-in duration-300">
        <Header />
        <div className="w-full h-64 flex flex-col items-center justify-center border border-dashed border-red-200 rounded-3xl p-6 bg-red-50/20 select-none">
          <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
          <span className="text-[14px] text-red-600 font-bold">Access Denied.</span>
          <span className="text-[12px] text-zinc-500 font-medium mt-1">
            Only the subject creator has permissions to manage course materials.
          </span>
          <Link
            href="/dashboard"
            className="mt-4 px-5 py-2.5 bg-[#121212] text-white font-bold rounded-full text-[12px] hover:bg-zinc-800 transition-all shadow-sm"
          >
            Go back
          </Link>
        </div>
      </div>
    );
  }


  const handleLecturerEmailChange = (index: number, emailValue: string) => {
    setSubjectLecturers((prev) => {
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
    setSubjectLecturers((prev) => {
      const copy = [...prev];
      copy[index].name = nameValue;
      return copy;
    });
  };


  const handleScheduleChange = (index: number, field: keyof FormSchedule, value: string) => {
    setSubjectSchedules((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };


  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorFields({});

    const errors: { [key: string]: string } = {};
    if (!subjectName.trim()) {
      errors.subjectName = "Subject name is required.";
    }

    const validLecturers = subjectLecturers.filter((l) => l.email.trim() !== "" && l.name.trim() !== "");
    if (validLecturers.length === 0) {
      errors.subjectLecturers = "At least one lecturer with email and display name is required.";
    }

    subjectSchedules.forEach((sch, idx) => {
      if (!sch.startTime || !sch.endTime) {
        errors.subjectSchedules = "All schedule rows must have start and end times.";
      } else if (sch.startTime >= sch.endTime) {
        errors.subjectSchedules = "Start time must be earlier than end time.";
      }
    });

    if (Object.keys(errors).length > 0) {
      setErrorFields(errors);
      return;
    }

    setIsSaving(true);

    const mappedLecturers = validLecturers.map((l) => {
      const existing = subject.lecturers.find((ol) => ol.email === l.email);
      return {
        userId: existing ? existing.userId : `u_lecturer_${Math.random().toString(36).substring(2, 7)}`,
        name: l.name.trim(),
        email: l.email.trim(),
      };
    });

    const mappedSchedules = subjectSchedules.map((sch) => ({
      day: sch.day,
      startTime: sch.startTime,
      endTime: sch.endTime,
      room: sch.room.trim() || subjectRoom.trim() || "Online Classroom",
    }));

    const updatedSubject = {
      ...subject,
      name: subjectName.trim(),
      description: subjectDesc.trim(),
      room: subjectRoom.trim() || "Online Classroom",
      color: subjectColor,
      lecturers: mappedLecturers,
      schedules: mappedSchedules,
      isOpen,
      category,
    };

    setTimeout(() => {
      updateSubject(updatedSubject);
      setIsSaving(false);
      setSuccessMessage("Subject details updated successfully!");
      setTimeout(() => {
        setSuccessMessage(null);
        router.push(`/dashboard/subject/${subject.id}`);
      }, 1000);
    }, 600);
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <>
      <Header />

      <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-4 flex flex-col gap-6 text-left select-none w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/subject/${subject.id}`}
            className="w-10 h-10 rounded-full border border-[#E5E1D8] flex items-center justify-center text-zinc-600 hover:bg-white hover:border-zinc-400 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-[#121212] tracking-tight">
              Edit Subject Details
            </h1>
            <p className="text-[12px] text-zinc-500 font-medium">
              Update course parameters, classroom, theme colors, lecturers, and class schedules.
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] font-bold px-4 py-3 rounded-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSaveDetails} className="flex flex-col gap-8 w-full">
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
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className={`w-full px-4 py-3 rounded-2xl border text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-[#f25c88]/20 focus:border-[#f25c88] transition-all duration-200 ${
                      errorFields.subjectName ? "border-red-400" : "border-zinc-200"
                    }`}
                  />
                  {errorFields.subjectName && (
                    <span className="text-[11px] text-red-500 font-bold">{errorFields.subjectName}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-zinc-600">Course Description</label>
                  <textarea
                    value={subjectDesc}
                    onChange={(e) => setSubjectDesc(e.target.value)}
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
                      value={subjectRoom}
                      onChange={(e) => setSubjectRoom(e.target.value)}
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
                      value={subjectColor}
                      onChange={(e) => setSubjectColor(e.target.value)}
                      className="w-10 h-11 rounded-xl cursor-pointer overflow-hidden bg-transparent"
                    />
                    <div className="flex flex-col select-none min-w-0">
                      <span className="text-[12.5px] font-extrabold text-zinc-800 uppercase tracking-wider">{subjectColor}</span>
                      <span className="text-[9px] text-zinc-400 font-bold leading-tight">Click block to pick color</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5 w-full mb-8 pl-12">
            <h3 className="text-[14.5px] font-bold text-[#121212] flex items-center gap-2 pb-2 border-b border-zinc-200">
              <Sparkles className="w-4.5 h-4.5 text-[#f25c88]" />
              Visibility & Invite Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="flex flex-col gap-5 border-r border-zinc-100/50 pr-0 md:pr-6">
                <div className="flex items-center justify-between bg-[#FAF7F2]/50 p-4 border border-[#E5E1D8]/30 rounded-2xl">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-extrabold text-zinc-800 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-zinc-500" />
                      Open Class Visibility
                    </span>
                    <span className="text-[10px] text-zinc-400 font-bold leading-normal">
                      Allow any authenticated user to search and join this class
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                      isOpen ? "bg-[#f25c88]" : "bg-zinc-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isOpen ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-zinc-600">Class Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-zinc-200 text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-[#f25c88]/20 focus:border-[#f25c88] transition-all duration-200 cursor-pointer"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Lab">Lab</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Clinical">Clinical</option>
                    <option value="Workshop">Workshop</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-bold text-zinc-600 flex items-center gap-1.5">
                    <LinkIcon className="w-4 h-4 text-zinc-500" />
                    Invite via Link
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={typeof window !== "undefined" ? `${window.location.origin}/dashboard/subject/${subject.id}/join` : ""}
                      className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 text-[13px] bg-[#FAF7F2]/50 text-zinc-500 font-semibold outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const link = typeof window !== "undefined" ? `${window.location.origin}/dashboard/subject/${subject.id}/join` : "";
                        navigator.clipboard.writeText(link);
                        setCopied(true);
                        showToast("Invite link copied to clipboard!", "success");
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="px-4 py-2.5 bg-[#121212] hover:bg-zinc-800 text-white text-[12px] font-bold rounded-2xl transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
                    >
                      {copied ? "Copied!" : "Copy Link"}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-bold text-zinc-600 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-zinc-500" />
                    Invite via Email (Mock)
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="academic-email@institution.edu"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#f25c88]/20 focus:border-[#f25c88] transition-all"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
                          showToast("Please enter a valid email address.", "error");
                          return;
                        }
                        setInvitedEmails((prev) => [...prev, inviteEmail.trim()]);
                        setInviteEmail("");
                        showToast(`Invitation sent to ${inviteEmail}!`, "success");
                      }}
                      className="px-5 py-2.5 bg-[#f25c88] hover:bg-[#d84b72] text-white text-[12px] font-bold rounded-2xl transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
                    >
                      Send Invite
                    </button>
                  </div>

                  {invitedEmails.length > 0 && (
                    <div className="mt-2.5 flex flex-col gap-1.5 bg-[#FAF7F2]/30 border border-[#E5E1D8]/20 p-3 rounded-2xl max-h-[120px] overflow-y-auto no-scrollbar">
                      <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1">
                        Invited Members
                      </span>
                      {invitedEmails.map((email, index) => (
                        <div key={index} className="flex justify-between items-center text-[12px] font-medium text-zinc-600 bg-white border border-[#E5E1D8]/20 px-3 py-1.5 rounded-xl">
                          <span className="truncate">{email}</span>
                          <span className="text-[9px] bg-amber-50 border border-amber-100 text-amber-700 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                            Pending
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5 w-full mb-8 pl-12">
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

            {errorFields.subjectLecturers && (
              <span className="text-[11px] text-red-500 font-bold">{errorFields.subjectLecturers}</span>
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
                  {subjectLecturers.map((lecturer, idx) => {
                    const initials = lecturer.name
                      ? lecturer.name.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase()
                      : "?";

                    return (
                      <tr key={idx} className="hover:bg-zinc-50/10 transition-colors">
                        <td className="py-3 pr-2">
                          <div
                            className="flex items-center justify-center w-8.5 h-8.5 rounded-full text-[10.5px] font-black border"
                            style={{
                              backgroundColor: hexToRgba(subjectColor, 0.08),
                              color: subjectColor,
                              borderColor: hexToRgba(subjectColor, 0.12)
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
                              e.target.style.borderColor = subjectColor;
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
                              e.target.style.borderColor = subjectColor;
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = "";
                            }}
                          />
                        </td>
                        <td className="py-3 text-right">
                          {subjectLecturers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setSubjectLecturers((prev) => prev.filter((_, i) => i !== idx))}
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

          <div className="flex flex-col gap-5 w-full mb-8 pl-12">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <h3 className="text-[14.5px] font-bold text-[#121212] flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-[#f25c88]" />
                Schedules
              </h3>
              <button
                type="button"
                onClick={() => setSubjectSchedules((prev) => [...prev, { day: "Monday", startTime: "09:00", endTime: "10:40", room: "" }])}
                className="flex items-center gap-1.5 px-4.5 py-2 rounded-full border border-zinc-200 bg-white hover:bg-[#FAF9F5] hover:border-zinc-400 text-[11px] font-bold text-zinc-700 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Time
              </button>
            </div>

            {errorFields.subjectSchedules && (
              <span className="text-[11px] text-red-500 font-bold">{errorFields.subjectSchedules}</span>
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
                  {subjectSchedules.map((schedule, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/10 transition-colors">
                      <td className="py-3 pr-4 w-[200px]">
                        <select
                          value={schedule.day}
                          onChange={(e) => handleScheduleChange(idx, "day", e.target.value)}
                          className="w-full px-1 py-2 bg-transparent border-b border-zinc-200 focus:outline-none text-[13px] font-semibold transition-colors duration-200 cursor-pointer"
                          onFocus={(e) => {
                            e.target.style.borderColor = subjectColor;
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
                            e.target.style.borderColor = subjectColor;
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
                            e.target.style.borderColor = subjectColor;
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
                            e.target.style.borderColor = subjectColor;
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "";
                          }}
                        />
                      </td>
                      <td className="py-3 text-right">
                        {subjectSchedules.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setSubjectSchedules((prev) => prev.filter((_, i) => i !== idx))}
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

          <div className="flex items-center gap-3 justify-end pt-6 border-t border-zinc-200 mt-4 pl-12">
            <Link
              href={`/dashboard/subject/${subject.id}`}
              className="px-6 py-2.5 border border-zinc-200 text-zinc-700 hover:text-[#121212] hover:border-zinc-400 font-bold rounded-full text-[12px] bg-white hover:bg-[#FAF9F5] transition-all cursor-pointer active:scale-[0.98]"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-2.5 bg-[#121212] hover:bg-zinc-800 text-white font-bold rounded-full text-[12px] shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-[0.98]"
            >
              {isSaving ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Save Details
            </button>
          </div>
        </form>

        <div className="border border-red-200/30 bg-red-50/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6 ml-12 animate-in fade-in duration-200">
          <div className="flex flex-col gap-1">
            <h4 className="text-[14.5px] font-extrabold text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
              Danger Zone
            </h4>
            <p className="text-[12px] text-zinc-500 font-medium">
              Deleting this subject is permanent and cannot be undone. All classes, events, and resources will be removed.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-6 py-3 bg-red-50 hover:bg-red-100/80 border border-red-200 text-red-600 hover:text-red-700 font-extrabold rounded-full text-[12px] transition-all cursor-pointer shadow-sm active:scale-[0.98] self-start md:self-center"
          >
            Delete Subject
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteSubject}
        title="Delete Subject"
        message={`Are you sure you want to delete "${subjectName}"? This action is permanent and cannot be undone.`}
        confirmText="Delete"
        isDanger={true}
        isLoading={isDeleting}
      />

      {isLecturerModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#E5E1D8] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            {}
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

            {}
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

            {}
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
