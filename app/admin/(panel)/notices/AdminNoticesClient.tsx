"use client";

import { useState, useTransition } from "react";
import { createNotice, deleteNotice } from "@/app/actions/adminNotices";

type User = { id: string; firstName: string; lastName: string; email: string };
type Notice = {
  id: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  user: { firstName: string; lastName: string; email: string };
};

export default function AdminNoticesClient({ users, initialNotices }: { users: User[], initialNotices: Notice[] }) {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter((u) => 
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    startTransition(async () => {
      await deleteNotice(id);
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await createNotice(fd);
      setShowForm(false);
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Notices</h1>
          <p className="text-sm text-white/50 mt-1">Send important notices to users.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-brand-cyan hover:bg-brand-cyan/80 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Send New Notice
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 rounded-xl bg-[#1a1a1c] border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">Draft Notice</h2>
          
          <div className="mb-4">
            <label className="block text-xs text-white/50 mb-1.5 uppercase">Select User</label>
            <input
              type="text"
              placeholder="Search user by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 px-3 bg-black/20 border border-white/10 rounded-lg text-white text-sm mb-2 focus:outline-none focus:border-brand-cyan"
            />
            <select name="userId" required className="w-full h-10 px-3 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-brand-cyan">
              <option value="">-- Choose User --</option>
              {filteredUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-xs text-white/50 mb-1.5 uppercase">Notice Title</label>
            <input name="title" required className="w-full h-10 px-3 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-brand-cyan" />
          </div>

          <div className="mb-6">
            <label className="block text-xs text-white/50 mb-1.5 uppercase">Notice Content</label>
            <textarea name="content" required rows={5} className="w-full p-3 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-brand-cyan"></textarea>
          </div>

          <div className="flex gap-3">
            <button disabled={isPending} type="submit" className="px-5 py-2 bg-brand-cyan text-white text-sm font-semibold rounded-lg disabled:opacity-50">
              {isPending ? "Sending..." : "Send Notice"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 bg-white/5 text-white/70 text-sm font-semibold rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-white/10 overflow-hidden bg-[#1a1a1c]">
        <table className="w-full text-left text-sm text-white/70">
          <thead className="bg-black/20 text-xs uppercase text-white/40">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Sent At</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {initialNotices.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-white/30">No notices sent yet.</td>
              </tr>
            ) : (
              initialNotices.map((n) => (
                <tr key={n.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{n.user.firstName} {n.user.lastName}</div>
                    <div className="text-xs text-white/40">{n.user.email}</div>
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate">{n.title}</td>
                  <td className="px-4 py-3">
                    {n.isRead ? (
                      <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">Read</span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded">Unread</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">{new Date(n.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(n.id)} disabled={isPending} className="text-rose-400 hover:text-rose-300 text-xs font-medium disabled:opacity-50">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
