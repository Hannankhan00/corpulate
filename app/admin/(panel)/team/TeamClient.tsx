"use client";

import { useState, useActionState, useEffect } from "react";
import { createAdminMember, updateAdminMember } from "@/app/actions/admin-auth";
import type { AdminRole } from "@/lib/admin-session";

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
};

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  SUPPORT: "Support",
};

const ROLE_STYLE: Record<string, { bg: string; color: string }> = {
  SUPER_ADMIN: { bg: "rgba(148,82,232,0.18)", color: "#C64CD3" },
  ADMIN:       { bg: "rgba(59,130,246,0.18)", color: "#60A5FA" },
  SUPPORT:     { bg: "rgba(16,185,129,0.15)", color: "#34D399" },
};

function RoleBadge({ role }: { role: string }) {
  const s = ROLE_STYLE[role] ?? { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" };
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      {ROLE_LABEL[role] ?? role}
    </span>
  );
}

function CreateMemberForm({
  actorRole,
  onSuccess,
}: {
  actorRole: AdminRole;
  onSuccess: () => void;
}) {
  const [state, formAction, isPending] = useActionState(createAdminMember, undefined);

  useEffect(() => {
    if (state?.message === "success") onSuccess();
  }, [state, onSuccess]);

  const roleOptions =
    actorRole === "SUPER_ADMIN"
      ? [
          { value: "ADMIN", label: "Admin" },
          { value: "SUPPORT", label: "Support" },
        ]
      : [{ value: "SUPPORT", label: "Support" }];

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.message && state.message !== "success" && (
        <div
          className="px-4 py-3 rounded-xl text-sm text-red-300"
          style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          {state.message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-white/50 mb-2 uppercase tracking-wide">Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="Jane Smith"
            required
            className="w-full h-10 rounded-[10px] px-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/40 transition-colors"
            style={{ background: "#111113", border: "1px solid rgba(255,255,255,0.12)" }}
          />
          {state?.errors?.name && (
            <p className="text-xs text-red-400 mt-1">{state.errors.name[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-xs text-white/50 mb-2 uppercase tracking-wide">Email</label>
          <input
            type="email"
            name="email"
            placeholder="jane@example.com"
            required
            className="w-full h-10 rounded-[10px] px-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/40 transition-colors"
            style={{ background: "#111113", border: "1px solid rgba(255,255,255,0.12)" }}
          />
          {state?.errors?.email && (
            <p className="text-xs text-red-400 mt-1">{state.errors.email[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-xs text-white/50 mb-2 uppercase tracking-wide">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Min. 8 characters"
            required
            className="w-full h-10 rounded-[10px] px-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/40 transition-colors"
            style={{ background: "#111113", border: "1px solid rgba(255,255,255,0.12)" }}
          />
          {state?.errors?.password && (
            <p className="text-xs text-red-400 mt-1">{state.errors.password[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-xs text-white/50 mb-2 uppercase tracking-wide">Role</label>
          <select
            name="role"
            defaultValue={roleOptions[0].value}
            className="w-full h-10 rounded-[10px] px-3 text-sm text-white focus:outline-none focus:border-white/40 transition-colors cursor-pointer"
            style={{ background: "#111113", border: "1px solid rgba(255,255,255,0.12)", colorScheme: "dark" }}
          >
            {roleOptions.map((opt) => (
              <option key={opt.value} value={opt.value} style={{ background: "#111113" }}>
                {opt.label}
              </option>
            ))}
          </select>
          {state?.errors?.role && (
            <p className="text-xs text-red-400 mt-1">{state.errors.role[0]}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="h-10 px-6 rounded-[10px] text-sm font-semibold text-white cursor-pointer disabled:opacity-60 transition-opacity flex items-center gap-2"
          style={{
            background:
              "linear-gradient(90deg, #9452E8 12.5%, #C64CD3 29.3%, #E945A8 45.7%, #FF4AB3 61%, #FF5480 76%, #FF5B62 91.3%)",
          }}
        >
          {isPending ? (
            <>
              <svg className="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              Creating...
            </>
          ) : (
            "Create Member"
          )}
        </button>
      </div>
    </form>
  );
}

function EditMemberRow({
  member,
  onDone,
}: {
  member: Member;
  onDone: () => void;
}) {
  const [state, formAction, isPending] = useActionState(updateAdminMember, undefined);

  useEffect(() => {
    if (state?.message === "success") onDone();
  }, [state, onDone]);

  return (
    <tr style={{ background: "rgba(148,82,232,0.06)" }}>
      <td className="px-6 py-4 text-white font-medium">{member.name}</td>
      <td className="px-6 py-4 text-white/50 text-xs">{member.email}</td>
      <td className="px-6 py-4" colSpan={3}>
        <form action={formAction} className="flex items-center gap-3">
          <input type="hidden" name="id" value={member.id} />

          {state?.message && state.message !== "success" && (
            <span className="text-xs text-red-400">{state.message}</span>
          )}

          <select
            name="role"
            defaultValue={member.role}
            className="h-8 rounded-lg px-2 text-xs text-white focus:outline-none cursor-pointer"
            style={{ background: "#1a1a1c", border: "1px solid rgba(255,255,255,0.15)", colorScheme: "dark" }}
          >
            <option value="SUPER_ADMIN" style={{ background: "#1a1a1c" }}>Super Admin</option>
            <option value="ADMIN" style={{ background: "#1a1a1c" }}>Admin</option>
            <option value="SUPPORT" style={{ background: "#1a1a1c" }}>Support</option>
          </select>

          <select
            name="isActive"
            defaultValue={member.isActive ? "true" : "false"}
            className="h-8 rounded-lg px-2 text-xs text-white focus:outline-none cursor-pointer"
            style={{ background: "#1a1a1c", border: "1px solid rgba(255,255,255,0.15)", colorScheme: "dark" }}
          >
            <option value="true" style={{ background: "#1a1a1c" }}>Active</option>
            <option value="false" style={{ background: "#1a1a1c" }}>Inactive</option>
          </select>

          <button
            type="submit"
            disabled={isPending}
            className="h-8 px-4 rounded-lg text-xs font-semibold text-white cursor-pointer disabled:opacity-60 transition-opacity"
            style={{
              background:
                "linear-gradient(90deg, #9452E8, #E945A8)",
            }}
          >
            {isPending ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
            onClick={onDone}
            className="h-8 px-3 rounded-lg text-xs text-white/40 hover:text-white transition-colors cursor-pointer"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            Cancel
          </button>
        </form>
      </td>
    </tr>
  );
}

export default function TeamClient({
  members,
  actorId,
  actorRole,
}: {
  members: Member[];
  actorId: string;
  actorRole: AdminRole;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [localMembers, setLocalMembers] = useState(members);

  useEffect(() => {
    setLocalMembers(members);
  }, [members]);

  const canManage = actorRole === "SUPER_ADMIN" || actorRole === "ADMIN";

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Team</h1>
          <p className="text-sm text-white/40 mt-1">
            {localMembers.length} member{localMembers.length !== 1 ? "s" : ""} in the admin panel.
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={() => setShowCreate((v) => !v)}
            className="h-10 px-5 rounded-[10px] text-sm font-semibold text-white cursor-pointer transition-opacity flex items-center gap-2"
            style={{
              background: showCreate
                ? "rgba(255,255,255,0.08)"
                : "linear-gradient(90deg, #9452E8 12.5%, #C64CD3 29.3%, #E945A8 45.7%, #FF4AB3 61%, #FF5480 76%, #FF5B62 91.3%)",
              border: showCreate ? "1px solid rgba(255,255,255,0.12)" : "none",
            }}
          >
            {showCreate ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add Member
              </>
            )}
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreate && canManage && (
        <div
          className="rounded-xl p-6 mb-6"
          style={{ background: "rgba(26,26,28,0.9)", border: "1px solid rgba(148,82,232,0.25)" }}
        >
          <h2 className="text-sm font-semibold text-white/70 mb-5 uppercase tracking-wide">New Team Member</h2>
          <CreateMemberForm
            actorRole={actorRole}
            onSuccess={() => {
              setShowCreate(false);
              window.location.reload();
            }}
          />
        </div>
      )}

      {/* Members table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "rgba(26,26,28,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {localMembers.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-white/30">No team members yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-white/35 uppercase tracking-wide">Name</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-white/35 uppercase tracking-wide">Email</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-white/35 uppercase tracking-wide">Role</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-white/35 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-white/35 uppercase tracking-wide">Joined</th>
                  {actorRole === "SUPER_ADMIN" && (
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-white/35 uppercase tracking-wide"></th>
                  )}
                </tr>
              </thead>
              <tbody>
                {localMembers.map((member) =>
                  editingId === member.id ? (
                    <EditMemberRow
                      key={member.id}
                      member={member}
                      onDone={() => {
                        setEditingId(null);
                        window.location.reload();
                      }}
                    />
                  ) : (
                    <tr
                      key={member.id}
                      className="border-b border-white/4 hover:bg-white/3 transition-colors"
                      style={member.id === actorId ? { background: "rgba(148,82,232,0.05)" } : {}}
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                            style={{
                              background: ROLE_STYLE[member.role]?.bg ?? "rgba(255,255,255,0.08)",
                              color: ROLE_STYLE[member.role]?.color ?? "rgba(255,255,255,0.5)",
                            }}
                          >
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-white font-medium">
                            {member.name}
                            {member.id === actorId && (
                              <span className="ml-1.5 text-[10px] text-white/30">(you)</span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-white/50 text-xs">{member.email}</td>
                      <td className="px-6 py-3.5">
                        <RoleBadge role={member.role} />
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                          style={
                            member.isActive
                              ? { background: "rgba(16,185,129,0.12)", color: "#34D399" }
                              : { background: "rgba(239,68,68,0.12)", color: "#F87171" }
                          }
                        >
                          {member.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-white/40 text-xs">
                        {new Date(member.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>
                      {actorRole === "SUPER_ADMIN" && (
                        <td className="px-6 py-3.5">
                          {member.id !== actorId && (
                            <button
                              type="button"
                              onClick={() => setEditingId(member.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white/50 hover:text-white transition-colors cursor-pointer"
                              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }}
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
