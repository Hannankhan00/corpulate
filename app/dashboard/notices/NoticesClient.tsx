"use client";

import React, { useTransition } from "react";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { markNoticeAsRead } from "@/app/actions/userNotices";

const PAGE_BG =
  "radial-gradient(ellipse 60% 80% at 0% 50%, rgba(13,100,139,0.45) 0%, rgba(6,6,6,0) 55%), radial-gradient(ellipse 50% 70% at 100% 30%, rgba(65,18,38,0.55) 0%, rgba(6,6,6,0) 55%), #070707";

const CARD_STYLE = {
  background: "rgba(83,83,83,0.25)",
  border: "1px solid rgba(255,255,255,0.07)",
};

type Notice = {
  id: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
};

export default function NoticesClient({ user, notices }: { user: { firstName: string }, notices: Notice[] }) {
  const [isPending, startTransition] = useTransition();

  const handleMarkRead = (id: string, currentlyRead: boolean) => {
    if (currentlyRead) return;
    startTransition(async () => {
      await markNoticeAsRead(id);
    });
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: PAGE_BG }}>
      <Sidebar activeItem="notices" />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
        <Header 
          firstName={user.firstName} 
          title="My Notices" 
          subtitle="View important updates and communications from our team." 
        />

        <div className="w-full mt-6 flex flex-col gap-6">
          <div className="rounded-[15px] p-6" style={CARD_STYLE}>
            <div className="mb-6 pb-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Inbox</h2>
            </div>

            <div className="flex flex-col gap-4">
              {notices.length === 0 ? (
                <div className="py-12 text-center text-white/40">
                  <p>You have no notices at this time.</p>
                </div>
              ) : (
                notices.map((notice) => (
                  <div
                    key={notice.id}
                    onClick={() => handleMarkRead(notice.id, notice.isRead)}
                    className={`relative p-5 rounded-xl border border-white/10 transition-colors cursor-pointer ${
                      notice.isRead ? "bg-white/[0.02] opacity-80" : "bg-brand-cyan/5 hover:bg-brand-cyan/10"
                    }`}
                  >
                    {!notice.isRead && (
                      <span className="absolute top-4 right-4 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-cyan"></span>
                      </span>
                    )}
                    <h4 className={`font-semibold text-base mb-2 flex items-center gap-2 ${notice.isRead ? "text-white/80" : "text-white"}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 ${notice.isRead ? "text-white/40" : "text-brand-cyan"}`}>
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      {notice.title}
                    </h4>
                    <p className="text-sm text-white/70 whitespace-pre-wrap mb-4">{notice.content}</p>
                    <p className="text-[11px] text-white/40 uppercase tracking-wider">
                      {new Date(notice.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
