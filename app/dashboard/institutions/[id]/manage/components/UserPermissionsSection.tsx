"use client";

import React from "react";
import { Users, HelpCircle, Link, Trash2 } from "lucide-react";
import { useTableControls } from "../hooks/useTableControls";
import TableControls from "./TableControls";
import TablePagination from "./TablePagination";
import SortableHeader from "./SortableHeader";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface UserPermission {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  department: string;
  permissions: string;
  status: string;
}

interface UserPermissionsSectionProps {
  usersPermissions: UserPermission[];
  setUsersPermissions: React.Dispatch<React.SetStateAction<UserPermission[]>>;
  showToast: (msg: string, type: "success" | "error") => void;
  inviteCode: string;
  isOwner: boolean;
  institutionId: string;
}

export default function UserPermissionsSection({
  usersPermissions,
  setUsersPermissions,
  showToast,
  inviteCode,
  isOwner,
  institutionId,
}: UserPermissionsSectionProps) {
  const {
    search,
    setSearch,
    sortKey,
    sortDir,
    toggleSort,
    page,
    setPage,
    pageSize,
    setPageSize,
    paged,
    totalPages,
    totalFiltered,
  } = useTableControls<UserPermission>({
    data: usersPermissions,
    searchFields: ["name", "email", "role", "department"],
    defaultSort: "name",
  });

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/institutions/${institutionId}/users/${userId}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ role: newRole }),
        }
      );
      if (!res.ok) throw new Error("Failed to update role");
      setUsersPermissions((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      showToast("Role updated successfully.", "success");
    } catch {
      showToast("Failed to update role. Please try again.", "error");
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/institutions/${institutionId}/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      if (!res.ok) throw new Error("Failed to remove user");
      setUsersPermissions((prev) => prev.filter((u) => u.id !== userId));
      showToast("User removed from institution.", "success");
    } catch {
      showToast("Failed to remove user. Please try again.", "error");
    }
  };

  return (
    <div id="user-permissions" className="flex flex-col gap-8 w-full mb-16 lg:pl-12 scroll-mt-24">
      <div className="flex flex-col">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <h3 className="text-[14.5px] font-bold text-[#121212] flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-[#d97706]" />
              User Permissions
            </h3>
            <button
              type="button"
              onClick={() =>
                showToast(
                  "Modify administrative roles and access rights for institution members.",
                  "success"
                )
              }
              className="w-5 h-5 rounded-full bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-400 hover:text-zinc-600 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 group/help relative"
            >
              <HelpCircle className="w-3 h-3" />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-zinc-950 text-white text-[9px] font-bold rounded-lg opacity-0 group-hover/help:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-md z-30 border border-zinc-800">
                Help &amp; Docs
              </span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!inviteCode) {
                showToast("Invite code not ready yet.", "error");
                return;
              }
              const link = `${window.location.origin}/dashboard/institutions/join?code=${inviteCode}`;
              navigator.clipboard.writeText(link);
              showToast("Institution join link copied to clipboard!", "success");
            }}
            className="flex items-center gap-1.5 px-4.5 py-2 rounded-full border border-zinc-200 bg-white hover:bg-[#FAF9F5] hover:border-zinc-400 text-[11px] font-bold text-zinc-700 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <Link className="w-3.5 h-3.5 text-[#d97706]" />
            Copy Join Link
          </button>
        </div>
        <p className="text-[12px] text-zinc-400 font-medium -mt-1 pl-6">
          Control administrative and academic roles for faculty members, owners, and admissions staff.
        </p>
      </div>

      <TableControls
        search={search}
        onSearchChange={setSearch}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        total={usersPermissions.length}
        filtered={totalFiltered}
        searchPlaceholder="Search by name, email, role..."
      />

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[750px]">
          <thead>
            <tr className="border-b border-zinc-200">
              <th className="pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider w-16">
                Avatar
              </th>
              <SortableHeader
                label="User Details"
                sortKey="name"
                currentSort={sortKey as string | null}
                sortDir={sortDir}
                onSort={(k) => toggleSort(k as keyof UserPermission)}
              />
              <SortableHeader
                label="Department"
                sortKey="department"
                currentSort={sortKey as string | null}
                sortDir={sortDir}
                onSort={(k) => toggleSort(k as keyof UserPermission)}
              />
              <th className="pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                Permissions
              </th>
              <SortableHeader
                label="Status"
                sortKey="status"
                currentSort={sortKey as string | null}
                sortDir={sortDir}
                onSort={(k) => toggleSort(k as keyof UserPermission)}
              />
              <SortableHeader
                label="Role"
                sortKey="role"
                currentSort={sortKey as string | null}
                sortDir={sortDir}
                onSort={(k) => toggleSort(k as keyof UserPermission)}
              />
              <th className="pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider w-16 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100/55">
            {paged.map((user) => {
              const initials = user.name
                ? user.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()
                : "?";

              return (
                <tr key={user.id} className="hover:bg-zinc-50/10 transition-colors">
                  <td className="py-3 pr-2">
                    {user.avatar && user.avatar.trim().length > 0 ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8.5 h-8.5 rounded-full object-cover border border-zinc-200/50 shadow-sm"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-8.5 h-8.5 rounded-full text-[10.5px] font-black bg-zinc-100 text-zinc-700 border border-zinc-200/50">
                        {initials}
                      </div>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-zinc-800">{user.name}</span>
                      <span className="text-[10px] text-zinc-400 font-medium">{user.email}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-[12.5px] text-zinc-600 font-semibold">
                      {user.department}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-[12px] text-zinc-500 font-medium">
                      {user.permissions}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-[9.5px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    {user.role === "owner" ? (
                      <span className="text-[10.5px] font-extrabold text-[#d97706] bg-[#facc15]/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Owner
                      </span>
                    ) : isOwner ? (
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="px-2 py-1 bg-transparent border-b border-zinc-200 focus:outline-none text-[13px] font-semibold transition-colors duration-200 cursor-pointer"
                      >
                        <option value="lecturer">Lecturer</option>
                        <option value="admission">Admission</option>
                      </select>
                    ) : (
                      <span className="text-[10.5px] font-extrabold text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {user.role === "admission" ? "Admission" : "Lecturer"}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    {isOwner && user.role !== "owner" && (
                      <button
                        type="button"
                        onClick={() => handleRemoveUser(user.id)}
                        className="p-2 text-zinc-400 hover:text-rose-600 transition-colors duration-200 cursor-pointer inline-flex items-center justify-center active:scale-95"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {paged.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center">
                  <span className="text-[12px] text-zinc-400 font-semibold">No users found.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <TablePagination
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        total={totalFiltered}
        onPage={setPage}
        label="members"
      />
    </div>
  );
}
