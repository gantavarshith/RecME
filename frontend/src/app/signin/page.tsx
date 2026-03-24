"use client";

import { motion } from "framer-motion";
import { UserCircle, Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  return (
    <main className="flex-1 flex items-center justify-center p-6 bg-transparent">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl p-8 rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl"
        >
          <div className="flex flex-col items-center text-center mb-8">
            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-600 dark:text-purple-400 mb-4">
              <UserCircle className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Welcome Back
            </h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">
              Sign in to sync your recommendations and watchlist.
            </p>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-zinc-950/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-zinc-950/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                />
              </div>
            </div>

            <button
              className="w-full py-3 mt-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center justify-center gap-2 transition-all group"
            >
              Sign In
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 text-center text-xs text-gray-400">
            Don't have an account?{" "}
            <Link href="/signup" className="font-bold text-purple-600 dark:text-purple-400 hover:underline">
              Create one now
            </Link>
          </div>
        </motion.div>
      </main>
  );
}
