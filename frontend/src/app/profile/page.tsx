"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Edit3,
  Check,
  X,
  Loader2,
  Trash2,
  AlertTriangle,
  LogOut,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuthStore } from "@/store/authStore";
import { updateProfile, deleteAccount, getUserStats } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, isAuthenticated, updateUser, logout } = useAuthStore();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState("");

  const [isClient, setIsClient] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Hydration guard for Next.js
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (isClient && !isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchStats = async () => {
      if (!token) return;
      try {
        const data = await getUserStats(token);
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    if (isClient && isAuthenticated) {
      fetchStats();
    }
  }, [isClient, isAuthenticated, token, router]);

  if (!isClient || !isAuthenticated || !user) return null;

  const joinedDate = user.created_at 
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const startEditing = () => {
    setNameInput(user.name);
    setNameError("");
    setEditingName(true);
  };

  const cancelEditing = () => {
    setEditingName(false);
    setNameError("");
  };

  const saveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) { setNameError("Name cannot be empty."); return; }
    if (trimmed === user.name) { setEditingName(false); return; }
    if (!token) return;
    setNameSaving(true);
    setNameError("");
    try {
      const updated = await updateProfile(trimmed, token);
      updateUser({ ...user, name: updated.name });
      setEditingName(false);
    } catch (err: any) {
      setNameError(err?.message || "Failed to save. Try again.");
    } finally {
      setNameSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!token) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteAccount(token);
      logout();
      router.push("/");
    } catch (err: any) {
      setDeleteError(err?.message || "Failed to delete account. Try again.");
      setDeleting(false);
    }
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Header */}
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              My Profile
            </h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Manage your account details
            </p>
          </div>

          {/* Profile Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
            {/* Avatar banner */}
            <div className="h-24 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600" />
            <div className="px-6 pb-6">
              <div className="flex items-end gap-4 -mt-10 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-purple-600 border-4 border-white dark:border-zinc-900 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                  {initials}
                </div>
                <div className="pb-1">
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      user.email
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                        : "bg-gray-100 dark:bg-zinc-800 text-gray-500"
                    }`}
                  >
                    {user.auth_provider === "google" ? "Google" : "Local"} Account
                  </span>
                </div>
              </div>

              {/* Name field */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <User className="w-4 h-4 text-purple-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wide mb-0.5">
                        Name
                      </p>
                      {editingName ? (
                        <input
                          autoFocus
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveName();
                            if (e.key === "Escape") cancelEditing();
                          }}
                          className="w-full text-sm font-semibold text-gray-900 dark:text-white bg-transparent border-b-2 border-purple-500 focus:outline-none pb-0.5"
                        />
                      ) : (
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {user.name}
                        </p>
                      )}
                      {nameError && (
                        <p className="text-xs text-red-500 mt-1">{nameError}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-3 shrink-0">
                    {editingName ? (
                      <>
                        <button
                          onClick={saveName}
                          disabled={nameSaving}
                          className="p-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all disabled:opacity-50"
                          title="Save"
                        >
                          {nameSaving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-400 transition-all"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={startEditing}
                        className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-400 hover:text-purple-500 transition-all"
                        title="Edit name"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Email (read-only) */}
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50">
                  <Mail className="w-4 h-4 text-purple-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wide mb-0.5">
                      Email
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user.email}
                    </p>
                  </div>
                  <span className="ml-auto text-[10px] text-gray-400 bg-gray-200 dark:bg-zinc-700 px-2 py-0.5 rounded-full shrink-0">
                    read-only
                  </span>
                </div>

                {/* Member since */}
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50">
                  <Calendar className="w-4 h-4 text-purple-500 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wide mb-0.5">
                      Member Since
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {joinedDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Stats Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm p-6">
            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4">
              My Viewing Stats
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10">
                <p className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
                  Top Genre
                </p>
                <div className="text-xl font-black text-gray-900 dark:text-white">
                  {loadingStats ? (
                    <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                  ) : stats?.top_genre && stats.top_genre !== "N/A" ? (
                    stats.top_genre
                  ) : (
                    <span className="text-xs font-normal text-gray-400">Watch 10 films to unlock</span>
                  )}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                  Films Watched
                </p>
                <p className="text-xl font-black text-gray-900 dark:text-white">
                  {loadingStats ? (
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                  ) : (
                    stats?.watched_count || 0
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-red-100 dark:border-red-900/20 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-red-500" />
              <h2 className="text-sm font-black text-red-600 dark:text-red-400 uppercase tracking-widest">
                Danger Zone
              </h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mb-4">
              Permanently delete your account and all associated data (watchlist, watched history). This cannot be undone.
            </p>
            <button
              onClick={() => { setShowDeleteModal(true); setDeleteConfirm(""); setDeleteError(""); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/20 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Delete My Account
            </button>
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-6 max-w-md w-full border border-red-100 dark:border-red-900/30"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white">Delete Account</h3>
                  <p className="text-xs text-gray-400">This action is irreversible</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-zinc-400 mb-4">
                This will permanently delete your account, watchlist, and watched history.
                Type <strong className="text-red-500">DELETE</strong> to confirm.
              </p>

              <input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 mb-3"
              />

              {deleteError && (
                <p className="text-xs text-red-500 mb-3">{deleteError}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm font-semibold text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirm !== "DELETE" || deleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  {deleting ? "Deleting…" : "Delete Forever"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
