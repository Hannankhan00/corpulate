"use client";

import { useState, useActionState } from "react";
import { submitApplicationInfo } from "@/app/actions/application";
import type { OnboardingField } from "@/app/generated/prisma/client";

export type ModalDoc = {
  name: string;
  description: string | null;
  isRequired: boolean;
};

export type ModalField = {
  fieldKey: OnboardingField;
  isRequired: boolean;
};

export type ModalUser = {
  dateOfBirth: string | null;
  fatherName: string | null;
  motherName: string | null;
  passportNumber: string | null;
  nationalId: string | null;
  ssn: string | null;
  taxId: string | null;
  address: string | null;
};

type Props = {
  applicationId: string;
  companyName: string | null;
  countryName: string;
  fields: ModalField[];
  documents: ModalDoc[];
  user: ModalUser;
};

const FIELD_META: Record<OnboardingField, { label: string; placeholder: string; type: string; wide?: boolean }> = {
  DATE_OF_BIRTH:   { label: "Date of Birth",          placeholder: "",                     type: "date" },
  FATHER_NAME:     { label: "Father's Full Name",      placeholder: "e.g. James Doe",       type: "text" },
  MOTHER_NAME:     { label: "Mother's Full Name",      placeholder: "e.g. Jane Doe",        type: "text" },
  ADDRESS:         { label: "Residential Address",     placeholder: "Full address",          type: "textarea", wide: true },
  PASSPORT_NUMBER: { label: "Passport Number",         placeholder: "e.g. A12345678",       type: "text" },
  NATIONAL_ID:     { label: "National ID Number",      placeholder: "e.g. 35201-1234567-1", type: "text" },
  SSN:             { label: "Social Security Number",  placeholder: "e.g. 123-45-6789",     type: "text" },
  TAX_ID:          { label: "Tax ID / UTR / SIN / BN", placeholder: "e.g. 12-3456789",      type: "text" },
};

const FIELD_KEYS: Record<OnboardingField, string> = {
  DATE_OF_BIRTH:   "dateOfBirth",
  FATHER_NAME:     "fatherName",
  MOTHER_NAME:     "motherName",
  ADDRESS:         "address",
  PASSPORT_NUMBER: "passportNumber",
  NATIONAL_ID:     "nationalId",
  SSN:             "ssn",
  TAX_ID:          "taxId",
};

function getDefaultValue(fieldKey: OnboardingField, user: ModalUser): string {
  const map: Record<OnboardingField, string | null> = {
    DATE_OF_BIRTH:   user.dateOfBirth,
    FATHER_NAME:     user.fatherName,
    MOTHER_NAME:     user.motherName,
    ADDRESS:         user.address,
    PASSPORT_NUMBER: user.passportNumber,
    NATIONAL_ID:     user.nationalId,
    SSN:             user.ssn,
    TAX_ID:          user.taxId,
  };
  return map[fieldKey] ?? "";
}

function inputCls(extra?: string) {
  return `w-full rounded-[10px] bg-[#16161c] border border-white/12 px-4 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 transition-colors ${extra ?? ""}`;
}

export default function PostPaymentModal({
  applicationId, companyName, countryName, fields, documents, user,
}: Props) {
  const hasFields = fields.length > 0;
  const hasDocs   = documents.length > 0;
  const twoSteps  = hasFields && hasDocs;

  const [step, setStep]     = useState<1 | 2>(hasFields ? 1 : 2);
  const [skipped, setSkipped] = useState<Record<string, boolean>>({});
  const [fileNames, setFileNames] = useState<Record<string, string>>({});
  const [state, action, pending] = useActionState(submitApplicationInfo, null);

  if (state && "ok" in state) return null;

  function toggleSkip(docName: string) {
    setSkipped((prev) => ({ ...prev, [docName]: !prev[docName] }));
  }

  function handleFileChange(fieldKey: string, file: File | null) {
    setFileNames((prev) => ({ ...prev, [fieldKey]: file?.name ?? "" }));
  }

  const stepLabel = twoSteps
    ? (step === 1 ? "Step 1 of 2 — Personal Information" : "Step 2 of 2 — Document Uploads")
    : hasFields ? "Personal Information" : "Document Uploads";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.90)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="relative w-full max-w-5xl flex flex-col rounded-[22px] overflow-hidden"
        style={{ background: "#0d0d12", border: "1px solid rgba(255,255,255,0.09)", maxHeight: "88vh" }}
      >
        {/* ── Banner ─────────────────────────────────────────── */}
        <div
          className="shrink-0 px-4 md:px-8 py-5 flex items-start gap-4"
          style={{
            background: "linear-gradient(90deg, rgba(234,88,12,0.22) 0%, rgba(234,88,12,0.07) 100%)",
            borderBottom: "1px solid rgba(234,88,12,0.25)",
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: "rgba(234,88,12,0.20)", border: "1px solid rgba(234,88,12,0.45)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#FB923C" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" width={17} height={17}>
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth={2.8} />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4">
              <p className="font-black text-white text-[15px] tracking-tight">REQUIRED: Complete Your Application</p>
              <span className="text-xs text-white/35 shrink-0">{stepLabel}</span>
            </div>
            <p className="text-sm text-orange-300/75 mt-1 leading-relaxed">
              Payment for <span className="font-bold text-orange-200">{companyName ?? "your company"}</span> in{" "}
              <span className="font-bold text-orange-200">{countryName}</span> received.
              Submit the required information before we can process your application.{" "}
              <span className="font-semibold text-white/80">This cannot be skipped.</span>
            </p>
          </div>
        </div>

        {/* ── Step tabs (only when both steps exist) ──────── */}
        {twoSteps && (
          <div
            className="shrink-0 flex items-center gap-0 px-8 pt-5 pb-0"
          >
            {[
              { n: 1, label: "Personal Information" },
              { n: 2, label: "Document Uploads" },
            ].map(({ n, label }, i) => {
              const active  = step === n;
              const done    = step > n;
              return (
                <div key={n} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setStep(n as 1 | 2)}
                    className="flex items-center gap-2.5 pb-3 cursor-pointer transition-colors"
                    style={{ borderBottom: active ? "2px solid #9452E8" : "2px solid transparent" }}
                  >
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{
                        background: active ? "linear-gradient(135deg,#9452E8,#FF5B62)" : done ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.08)",
                        color: active || done ? "white" : "rgba(255,255,255,0.35)",
                        border: done ? "1px solid rgba(16,185,129,0.4)" : "none",
                      }}
                    >
                      {done ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={11} height={11}>
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      ) : n}
                    </span>
                    <span
                      className="text-sm font-medium"
                      style={{ color: active ? "white" : "rgba(255,255,255,0.35)" }}
                    >
                      {label}
                    </span>
                  </button>
                  {i === 0 && (
                    <div className="w-8 h-px mx-3 mb-3" style={{ background: "rgba(255,255,255,0.12)" }} />
                  )}
                </div>
              );
            })}
            <div className="flex-1 border-b pb-3" style={{ borderColor: "rgba(255,255,255,0.07)" }} />
          </div>
        )}

        {/* ── Form ─────────────────────────────────────────── */}
        <form action={action} className="flex flex-col flex-1 min-h-0">
          {/* Hidden inputs — always in DOM */}
          <input type="hidden" name="applicationId" value={applicationId} />
          {documents.map((doc) => (
            <input key={doc.name} type="hidden" name="docName" value={doc.name} />
          ))}

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin px-4 md:px-8 py-6">
            {state && "error" in state && (
              <p className="text-red-400 text-sm mb-4 px-1">{String(state.error)}</p>
            )}

            {/* ── Step 1: Personal Info ── */}
            <div style={{ display: step === 1 ? "block" : "none" }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                {fields.map((f) => {
                  const meta = FIELD_META[f.fieldKey];
                  const name = FIELD_KEYS[f.fieldKey];
                  const defaultVal = getDefaultValue(f.fieldKey, user);
                  const label = meta.label + (f.isRequired ? "" : " (optional)");
                  const wide = meta.wide || meta.type === "date";

                  return (
                    <div key={f.fieldKey} className={wide ? "sm:col-span-2" : ""}>
                      <label className="block text-xs text-white/45 mb-2 uppercase tracking-wider">{label}</label>
                      {meta.type === "date" ? (
                        <input
                          name={name} type="date"
                          defaultValue={defaultVal}
                          required={f.isRequired}
                          className={`${inputCls()} h-12 max-w-xs`}
                          style={{ colorScheme: "dark" }}
                        />
                      ) : meta.type === "textarea" ? (
                        <textarea
                          name={name}
                          defaultValue={defaultVal}
                          required={f.isRequired}
                          rows={3}
                          placeholder={meta.placeholder}
                          className={`${inputCls()} py-3 resize-none`}
                        />
                      ) : (
                        <input
                          name={name} type="text"
                          defaultValue={defaultVal}
                          required={f.isRequired}
                          placeholder={meta.placeholder}
                          className={`${inputCls()} h-12`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Step 2: Documents ── */}
            <div style={{ display: step === 2 ? "block" : "none" }}>
              <p className="text-xs text-white/35 mb-5 leading-relaxed">
                Upload clear scans or photos. Toggle &quot;Upload Later&quot; for any document you don&apos;t have ready — you can submit it afterwards.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documents.map((doc) => {
                  const fieldKey  = `doc_${doc.name.replace(/\s+/g, "_")}`;
                  const isSkipped = skipped[doc.name] ?? false;
                  const uploaded  = fileNames[fieldKey];

                  return (
                    <div
                      key={doc.name}
                      className="rounded-[14px] p-5 flex flex-col gap-3 transition-all"
                      style={{
                        background: isSkipped ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)",
                        border: isSkipped ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(255,255,255,0.10)",
                        opacity: isSkipped ? 0.55 : 1,
                      }}
                    >
                      {/* Doc header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-white">{doc.name}</p>
                            {doc.isRequired && !isSkipped && (
                              <span
                                className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
                                style={{ background: "rgba(239,68,68,0.12)", color: "#F87171" }}
                              >
                                Required
                              </span>
                            )}
                          </div>
                          {doc.description && (
                            <p className="text-xs text-white/38 mt-1 leading-relaxed">{doc.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-white/40">Later</span>
                          <button
                            type="button"
                            onClick={() => toggleSkip(doc.name)}
                            className="w-9 h-5 rounded-full relative transition-colors cursor-pointer shrink-0"
                            style={{ background: isSkipped ? "linear-gradient(90deg,#9452E8,#FF5B62)" : "rgba(255,255,255,0.15)" }}
                          >
                            <span
                              className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                              style={{ left: isSkipped ? "calc(100% - 1.1rem)" : "0.1rem" }}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Upload zone */}
                      {!isSkipped && (
                        <label
                          className="flex flex-col items-center justify-center gap-2 rounded-xl px-4 py-5 cursor-pointer transition-colors"
                          style={{ background: "rgba(148,82,232,0.07)", border: "1.5px dashed rgba(148,82,232,0.30)" }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" width={22} height={22}>
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          {uploaded ? (
                            <span className="text-xs text-violet-300 text-center truncate max-w-full px-2">{uploaded}</span>
                          ) : (
                            <span className="text-xs text-violet-400/80">Click to upload</span>
                          )}
                          <span className="text-[10px] text-white/25">PDF, JPG, PNG, HEIC</span>
                          <input
                            name={fieldKey}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.heic"
                            className="hidden"
                            onChange={(e) => handleFileChange(fieldKey, e.target.files?.[0] ?? null)}
                          />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Footer navigation ─────────────────────────── */}
          <div
            className="shrink-0 px-4 md:px-8 py-4 md:py-5 flex flex-wrap items-center justify-between gap-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="text-xs text-white/25 leading-relaxed max-w-sm">
              Information is encrypted and only accessible to the Corpulate compliance team.
            </p>
            <div className="flex items-center gap-3 shrink-0">
              {twoSteps && step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-sm text-white/60 hover:text-white transition-colors cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              )}

              {twoSteps && step === 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-[10px] text-sm font-semibold text-white cursor-pointer"
                  style={{ background: "linear-gradient(90deg, #9452E8 12.5%, #C64CD3 29.3%, #E945A8 45.7%, #FF4AB3 61%, #FF5480 76%, #FF5B62 91.3%)" }}
                >
                  Continue
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={pending}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-[10px] text-sm font-semibold text-white cursor-pointer disabled:opacity-60 transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(90deg, #9452E8 12.5%, #C64CD3 29.3%, #E945A8 45.7%, #FF4AB3 61%, #FF5480 76%, #FF5B62 91.3%)" }}
                >
                  {pending ? "Submitting…" : "Submit Application"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
