"use client";

import React from "react";
import { Search, X, Plus } from "lucide-react";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSearchQuery: string;
  setUserSearchQuery: (val: string) => void;
  newUserRole: string;
  setNewUserRole: (val: string) => void;
  mockAvailableUsers: any[];
  usersPermissions: any[];
  onAddUser: (user: any) => void;
}

export default function AddUserModal({
  isOpen,
  onClose,
  userSearchQuery,
  setUserSearchQuery,
  newUserRole,
  setNewUserRole,
  mockAvailableUsers,
  usersPermissions,
  onAddUser,
}: AddUserModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#E5E1D8] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-extrabold text-[#121212] tracking-tight">Add User Permission</h3>
            <p className="text-[11px] text-zinc-400 font-medium">Assign a role to a new user in the institution</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 border-b border-zinc-100 bg-zinc-50/30 flex flex-col gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search user by name or email..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-zinc-200 bg-white text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[#d97706]/20 focus:border-[#f97316] transition-all"
              autoFocus
            />
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
          </div>

          <div className="flex items-center justify-between px-1">
            <span className="text-[12px] font-bold text-zinc-500">Select Role:</span>
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 text-[13px] font-semibold bg-white outline-none cursor-pointer focus:border-[#f97316]"
            >
              <option value="lecturer">Lecturer</option>
              <option value="admission">Admission</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 min-h-[200px] max-h-[350px] flex flex-col gap-1.5 no-scrollbar">
          {mockAvailableUsers
            .filter((u) => {
              const alreadyAdded = usersPermissions.some((up) => up.email === u.email);
              if (alreadyAdded) return false;
              const q = userSearchQuery.toLowerCase().trim();
              if (!q) return true;
              return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
            })
            .map((u) => {
              const initials = u.name.split(" ").map((w: string) => w[0]).join("").substring(0, 2).toUpperCase();
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => onAddUser(u)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-zinc-50 text-left transition-all group active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#facc15]/10 border border-[#f97316]/15 text-[#d97706] text-[11px] font-black">
                    {initials}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[13px] font-bold text-zinc-800 truncate">
                      {u.name}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-medium truncate">
                      {u.email}
                    </span>
                  </div>
                  <Plus className="w-4 h-4 text-zinc-300 group-hover:text-[#d97706] transition-colors mr-1" />
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}
