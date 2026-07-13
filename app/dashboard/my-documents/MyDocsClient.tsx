"use client";

import React, { useTransition } from "react";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { uploadUserDocument, deleteUserDocument, getDocumentDownloadUrl } from "@/app/actions/userDocuments";

// ── Shared Styling Constants ─────────────────────────────────────
const PAGE_BG =
  "radial-gradient(ellipse 60% 80% at 0% 50%, rgba(13,100,139,0.45) 0%, rgba(6,6,6,0) 55%), radial-gradient(ellipse 50% 70% at 100% 30%, rgba(65,18,38,0.55) 0%, rgba(6,6,6,0) 55%), #070707";

const CARD_STYLE = {
  background: "rgba(83,83,83,0.25)",
  border: "1px solid rgba(255,255,255,0.07)",
};

// ── Icons ─────────────────────────────────────────────────────
const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-brand-cyan">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <path d="M14 2v6h6" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

type Doc = {
  id: string;
  name: string;
  date: string;
  size: string;
  status: string;
  source: "corpulate" | "user";
};

export default function MyDocsClient({ user, initialDocuments }: { user: { firstName: string }; initialDocuments: Doc[] }) {
  const [activeTab, setActiveTab] = React.useState<"corpulate" | "user">("corpulate");
  const [isPending, startTransition] = useTransition();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        await uploadUserDocument(formData);
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    startTransition(async () => {
      await deleteUserDocument(id);
    });
  };

  const handleDownload = async (id: string) => {
    try {
      const url = await getDocumentDownloadUrl(id);
      window.open(url, "_blank");
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  const currentDocuments = initialDocuments.filter(d => d.source === activeTab);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: PAGE_BG }}>
      <Sidebar activeItem="my-documents" />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
        {/* Header Section */}
        <Header 
          firstName={user.firstName} 
          title="My Documents" 
          subtitle="Access and download all your official company formation documents and certificates." 
        />

        <div className="w-full mt-6 flex flex-col gap-6">
          {/* Tabs switcher */}
          <div className="flex gap-2 p-1 rounded-xl bg-[#12152E]/40 border border-white/5 self-start">
            <button
              type="button"
              onClick={() => setActiveTab("corpulate")}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === "corpulate"
                  ? "bg-white/[0.08] text-white shadow-sm border border-white/10"
                  : "text-white/50 hover:text-white/85"
              }`}
            >
              By Corpulate
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("user")}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === "user"
                  ? "bg-white/[0.08] text-white shadow-sm border border-white/10"
                  : "text-white/50 hover:text-white/85"
              }`}
            >
              Uploaded by Me
            </button>
          </div>

          <div className="rounded-[15px] p-6" style={CARD_STYLE}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {activeTab === "corpulate" ? "Company Documents" : "My Uploads"}
                </h2>
                <p className="text-sm text-white/50 mt-1">
                  {activeTab === "corpulate"
                    ? "Official documents issued by the state and federal government for your company."
                    : "Documents you have uploaded to your profile for reference and compliance."}
                </p>
              </div>

              {/* Upload Button */}
              {activeTab === "user" && (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPending}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white cursor-pointer transition-all duration-200 hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
                    style={{
                      background: "linear-gradient(90deg, #9452E8 12.5%, #FF5B62 91.3%)",
                    }}
                  >
                    {isPending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Upload Document
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/40">
                    <th className="pb-3 px-4 font-semibold">Document Name</th>
                    <th className="pb-3 px-4 font-semibold">Date Issued</th>
                    <th className="pb-3 px-4 font-semibold">Size</th>
                    <th className="pb-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {currentDocuments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/30">
                            <FileIcon />
                          </div>
                          <div>
                            <p className="font-semibold text-white/60 text-sm">No documents found</p>
                            <p className="text-xs text-white/35 mt-0.5">
                              {activeTab === "corpulate"
                                ? "There are no official company documents available yet."
                                : "Upload your first document to get started."}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}>
                              <FileIcon />
                            </div>
                            <div>
                              <p className="font-semibold text-white text-sm">{doc.name}</p>
                              {doc.status === "Pending" && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FCD34D] bg-[#FCD34D]/10 px-2 py-0.5 rounded-full mt-1 inline-block">
                                  Pending Processing
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-white/60">{doc.date}</td>
                        <td className="py-4 px-4 text-sm text-white/60">{doc.size}</td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {doc.status === "Available" ? (
                              <button 
                                type="button"
                                onClick={() => handleDownload(doc.id)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:text-white transition-colors cursor-pointer"
                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
                              >
                                <DownloadIcon />
                                Download
                              </button>
                            ) : (
                              <span className="text-sm text-white/30 italic mr-2">Not available yet</span>
                            )}
                            
                            {doc.source === "user" && (
                              <button 
                                type="button"
                                onClick={() => handleDelete(doc.id)}
                                disabled={isPending}
                                className="inline-flex items-center justify-center p-2 rounded-lg text-white/40 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-50"
                                title="Delete document"
                              >
                                <TrashIcon />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
