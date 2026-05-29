"use client";

import { useActionState } from "react";
import { updateApplicationStatus } from "@/app/actions/admin";

const STATUS_OPTIONS = [
  { value: "pending",    label: "Pending" },
  { value: "in_review",  label: "In Review" },
  { value: "processing", label: "Processing" },
  { value: "completed",  label: "Completed" },
  { value: "rejected",   label: "Rejected" },
];

export default function StatusForm({
  applicationId,
  currentStatus,
  currentNotes,
  canEdit,
}: {
  applicationId: string;
  currentStatus: string;
  currentNotes: string | null;
  canEdit: boolean;
}) {
  const [, formAction, isPending] = useActionState(updateApplicationStatus, undefined);

  if (!canEdit) {
    const s = STATUS_OPTIONS.find((o) => o.value === currentStatus);
    return (
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs text-white/50 mb-2 uppercase tracking-wide">Status</p>
          <p className="text-sm text-white/80 font-medium">{s?.label ?? currentStatus}</p>
        </div>
        {currentNotes && (
          <div>
            <p className="text-xs text-white/50 mb-2 uppercase tracking-wide">Admin Notes</p>
            <p className="text-sm text-white/60 whitespace-pre-wrap">{currentNotes}</p>
          </div>
        )}
        <p className="text-xs text-white/25 italic">Your role does not permit status changes.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={applicationId} />

      <div>
        <label className="block text-xs text-white/50 mb-2 uppercase tracking-wide">Status</label>
        <select
          name="status"
          defaultValue={currentStatus}
          className="w-full h-11 rounded-[10px] px-3 text-white text-sm focus:outline-none focus:border-white/40 transition-colors cursor-pointer"
          style={{ background: "#1a1a1c", border: "1px solid rgba(255,255,255,0.15)", colorScheme: "dark" }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ background: "#1a1a1c" }}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-white/50 mb-2 uppercase tracking-wide">Admin Notes</label>
        <textarea
          name="adminNotes"
          defaultValue={currentNotes ?? ""}
          rows={5}
          placeholder="Add internal notes about this application..."
          className="w-full rounded-[10px] px-3 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/40 transition-colors resize-none"
          style={{ background: "#1a1a1c", border: "1px solid rgba(255,255,255,0.15)" }}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full h-11 rounded-[10px] text-sm font-semibold text-white cursor-pointer disabled:opacity-60 transition-opacity flex items-center justify-center gap-2"
        style={{
          background:
            "linear-gradient(90deg, #9452E8 12.5%, #C64CD3 29.3%, #E945A8 45.7%, #FF4AB3 61%, #FF5480 76%, #FF5B62 91.3%)",
        }}
      >
        {isPending ? (
          <>
            <svg className="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </button>
    </form>
  );
}
