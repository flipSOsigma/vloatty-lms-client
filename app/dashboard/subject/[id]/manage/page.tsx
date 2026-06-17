"use client";

import React, { useState, useEffect } from "react";
import Header from "../../../../../components/views/Header";
import { useLms } from "../../../../../context/LmsContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ConfirmModal from "../../../../../components/ui/ConfirmModal";
import ImageCropModal from "../../../../../components/ui/ImageCropModal";
import { StorageTracker } from "../../../../../components/ui/StorageTracker";
import {
  ArrowLeft,
  Check,
  Calendar,
  Users,
  Settings,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import facultyMockRaw from "../../../../../public/data/users.json";

import BasicParametersSection from "./components/BasicParametersSection";
import CategoryInviteSection from "./components/CategoryInviteSection";
import LecturersSection from "./components/LecturersSection";
import SchedulesSection from "./components/SchedulesSection";
import DangerZoneSection from "./components/DangerZoneSection";
import LecturerSearchModal from "./components/LecturerSearchModal";
import UnsavedChangesModal from "./components/UnsavedChangesModal";

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
  const [activeSection, setActiveSection] = useState("basic-parameters");

  useEffect(() => {
    const sections = ["basic-parameters", "category-invite", "lecturers", "schedules", "danger-zone"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    sections.forEach((sid) => {
      const el = document.getElementById(sid);
      if (el) observer.observe(el);
    });

    return () => {
      sections.forEach((sid) => {
        const el = document.getElementById(sid);
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const sidebarSections = [
    { id: "basic-parameters", label: "Basic Parameters", icon: Settings },
    { id: "category-invite", label: "Category & Invite", icon: Sparkles },
    { id: "lecturers", label: "Lecturers", icon: Users },
    { id: "schedules", label: "Schedules", icon: Calendar },
    { id: "danger-zone", label: "Danger Zone", icon: AlertTriangle, isDanger: true },
  ];

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

  React.useEffect(() => {
    if (subject) {
      document.title = `${subject.name} - VLOATTY Learning Management System`;
    }
  }, [subject]);

  const [subjectName, setSubjectName] = useState("");
  const [subjectDesc, setSubjectDesc] = useState("");
  const [subjectRoom, setSubjectRoom] = useState("");
  const subjectColor = "#f25c88";
  const [subjectLecturers, setSubjectLecturers] = useState<FormLecturer[]>([]);
  const [subjectSchedules, setSubjectSchedules] = useState<FormSchedule[]>([]);
  const [subjectThumbnail, setSubjectThumbnail] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropFileName, setCropFileName] = useState("");

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    setCropImageSrc(null);
    const file = new File([croppedImageBlob], cropFileName || "thumbnail.jpg", { type: "image/jpeg" });
    await handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/upload?subjectId=${id}`, {
        method: "POST",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      if (!res.ok) {
        throw new Error("Upload failed");
      }
      const data = await res.json();
      setSubjectThumbnail(data.url);
      showToast("Thumbnail uploaded successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Upload failed. Please try again.", "error");
    } finally {
      setIsUploading(false);
    }
  };

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
      setSubjectThumbnail(subject.thumbnail || "");
      setSubjectLecturers(subject.lecturers.map((l) => ({ email: l.email || "", name: l.name })));
      setSubjectSchedules(
        subject.schedules ? subject.schedules.map((s) => ({ ...s, room: s.room || "" })) : []
      );
      setIsOpen(subject.isOpen ?? false);
      setCategory(subject.category ?? "Lecture");
    }
  }, [subject]);

  const isOwner = subject && currentUser && subject.createdBy === currentUser.id;

  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  const hasChanges = React.useMemo(() => {
    if (isSaving || isDeleting || !subject) return false;

    if (subjectName !== subject.name) return true;
    if (subjectDesc !== (subject.description || "")) return true;
    if (subjectRoom !== (subject.room || "")) return true;
    if (subjectThumbnail !== (subject.thumbnail || "")) return true;
    if (isOpen !== (subject.isOpen ?? false)) return true;
    if (category !== (subject.category ?? "Lecture")) return true;

    const origLecturers = subject.lecturers.map((l) => ({ email: l.email || "", name: l.name }));
    if (subjectLecturers.length !== origLecturers.length) return true;
    for (let i = 0; i < subjectLecturers.length; i++) {
      if (subjectLecturers[i].email !== origLecturers[i].email) return true;
      if (subjectLecturers[i].name !== origLecturers[i].name) return true;
    }

    const origSchedules = subject.schedules ? subject.schedules.map((s) => ({ ...s, room: s.room || "" })) : [];
    if (subjectSchedules.length !== origSchedules.length) return true;
    for (let i = 0; i < subjectSchedules.length; i++) {
      if (subjectSchedules[i].day !== origSchedules[i].day) return true;
      if (subjectSchedules[i].startTime !== origSchedules[i].startTime) return true;
      if (subjectSchedules[i].endTime !== origSchedules[i].endTime) return true;
      if (subjectSchedules[i].room !== origSchedules[i].room) return true;
    }

    return false;
  }, [
    subject,
    subjectName,
    subjectDesc,
    subjectRoom,
    subjectColor,
    subjectThumbnail,
    subjectLecturers,
    subjectSchedules,
    isOpen,
    category,
    isSaving,
    isDeleting,
  ]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasChanges]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      if (!hasChanges) return;
      const target = (e.target as HTMLElement).closest("a");
      if (target && target.href) {
        const currentUrl = new URL(window.location.href);
        const targetUrl = new URL(target.href, window.location.href);
        if (targetUrl.origin === currentUrl.origin && targetUrl.pathname !== currentUrl.pathname) {
          e.preventDefault();
          setPendingUrl(target.href);
          setIsUnsavedModalOpen(true);
        }
      }
    };
    document.addEventListener("click", handleAnchorClick, true);
    return () => {
      document.removeEventListener("click", handleAnchorClick, true);
    };
  }, [hasChanges]);

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

  const saveAndNavigate = async (destinationUrl?: string) => {
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
      return false;
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
      thumbnail: subjectThumbnail,
      lecturers: mappedLecturers,
      schedules: mappedSchedules,
      isOpen,
      category,
    };

    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        updateSubject(updatedSubject);
        setIsSaving(false);
        setSuccessMessage("Subject details updated successfully!");
        setTimeout(() => {
          setSuccessMessage(null);
          router.push(destinationUrl || `/dashboard/subject/${subject.id}`);
          resolve(true);
        }, 1000);
      }, 600);
    });
  };

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    saveAndNavigate();
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
              Manage Subject
            </h1>
            <p className="text-[12px] text-zinc-500 font-medium -mt-1">
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start w-full">
          <div className="lg:col-span-9 flex flex-col gap-24 w-full lg:pr-20">
            <form onSubmit={handleSaveDetails} className="flex flex-col gap-24 w-full">
              <BasicParametersSection
                subjectName={subjectName}
                setSubjectName={setSubjectName}
                subjectDesc={subjectDesc}
                setSubjectDesc={setSubjectDesc}
                subjectRoom={subjectRoom}
                setSubjectRoom={setSubjectRoom}
                subjectColor={subjectColor}
                subjectThumbnail={subjectThumbnail}
                setSubjectThumbnail={setSubjectThumbnail}
                isUploading={isUploading}
                setCropFileName={setCropFileName}
                setCropImageSrc={setCropImageSrc}
                errorFields={errorFields}
              />

              <CategoryInviteSection
                category={category}
                setCategory={setCategory}
                subjectColor={subjectColor}
                subjectId={subject.id}
                inviteEmail={inviteEmail}
                setInviteEmail={setInviteEmail}
                invitedEmails={invitedEmails}
                setInvitedEmails={setInvitedEmails}
                copied={copied}
                setCopied={setCopied}
                showToast={showToast}
              />

              <LecturersSection
                subjectLecturers={subjectLecturers}
                setSubjectLecturers={setSubjectLecturers}
                subjectColor={subjectColor}
                setIsLecturerModalOpen={setIsLecturerModalOpen}
                setLecturerSearchQuery={setLecturerSearchQuery}
                handleLecturerEmailChange={handleLecturerEmailChange}
                handleLecturerNameChange={handleLecturerNameChange}
                hexToRgba={hexToRgba}
                errorFields={errorFields}
              />

              <SchedulesSection
                subjectSchedules={subjectSchedules}
                setSubjectSchedules={setSubjectSchedules}
                subjectColor={subjectColor}
                handleScheduleChange={handleScheduleChange}
                daysOfWeek={daysOfWeek}
                errorFields={errorFields}
              />

              <div className="flex items-center gap-3 justify-end pt-8 border-t border-zinc-200 mt-8 lg:pl-12">
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

            <DangerZoneSection
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              setIsDeleteModalOpen={setIsDeleteModalOpen}
            />
          </div>

          <div className="lg:col-span-3 hidden lg:flex flex-col gap-5 sticky top-6 text-left self-start pl-6">
            {subjectThumbnail && subjectThumbnail.trim().length > 0 && (
              <div className="w-32 h-20 rounded-2xl overflow-hidden border border-[#E5E1D8]/60 shadow-sm shrink-0 mb-2">
                <img
                  src={subjectThumbnail}
                  alt="Thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <span className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider px-3">
              On This Page
            </span>
            <div className="flex flex-col gap-1 w-full">
              {sidebarSections.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => scrollToSection(sec.id)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[12.5px] font-bold transition-all text-left w-full group active:scale-[0.98] ${
                      isActive
                        ? sec.isDanger
                          ? "bg-red-50 text-red-600 border-l-2 border-red-500 rounded-l-none -ml-[25px] pl-[23px]"
                          : "rounded-l-none -ml-[25px] pl-[23px]"
                        : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50/80"
                    }`}
                    style={
                      isActive && !sec.isDanger
                        ? {
                            backgroundColor: hexToRgba(subjectColor, 0.05),
                            color: subjectColor,
                            borderLeft: `2px solid ${subjectColor}`,
                          }
                        : {}
                    }
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive
                          ? sec.isDanger
                            ? "text-red-500"
                            : ""
                          : "text-zinc-400 group-hover:text-zinc-600"
                      }`}
                      style={
                        isActive && !sec.isDanger
                          ? {
                              color: subjectColor,
                            }
                          : {}
                      }
                    />
                    <span className="truncate">{sec.label}</span>
                  </button>
                );
              })}
            </div>

            {subject && subject.institutionId && (
              <div className="mt-4 w-full">
                <StorageTracker institutionId={subject.institutionId} />
              </div>
            )}
          </div>
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

      <LecturerSearchModal
        isOpen={isLecturerModalOpen}
        onClose={() => {
          setIsLecturerModalOpen(false);
          setLecturerSearchQuery("");
        }}
        lecturerSearchQuery={lecturerSearchQuery}
        setLecturerSearchQuery={setLecturerSearchQuery}
        filteredSuggestions={filteredSuggestions}
        onSelectLecturer={handleSelectLecturer}
      />

      {cropImageSrc && (
        <ImageCropModal
          imageSrc={cropImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropImageSrc(null)}
        />
      )}

      <UnsavedChangesModal
        isOpen={isUnsavedModalOpen}
        onClose={() => {
          setIsUnsavedModalOpen(false);
          setPendingUrl(null);
        }}
        isSaving={isSaving}
        onSave={async () => {
          if (pendingUrl) {
            const saved = await saveAndNavigate(pendingUrl);
            if (saved) {
              setIsUnsavedModalOpen(false);
            }
          }
        }}
        onDecline={() => {
          setIsUnsavedModalOpen(false);
          if (pendingUrl) {
            router.push(pendingUrl);
          }
        }}
      />
    </>
  );
}
