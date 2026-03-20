"use client";

import { AuroraBackground } from "@/components/ui/aurora-background";
import { DisplayCardsDemo } from "@/components/ui/display-cards-demo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion } from "framer-motion";
import { Sparkles, MessageSquare, Play, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <AuroraBackground>
      <ThemeToggle />

      <div className="w-full max-w-6xl mx-auto px-6 py-20 flex flex-col items-center text-center gap-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-widest"
        >
          <Sparkles className="w-3 h-3" />
          Next-Gen Movie Discovery
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white tracking-tighter leading-none max-w-5xl"
        >
          RecME –{" "}
          <span className="bg-gradient-to-r from-purple-600 to-violet-500 dark:from-purple-400 dark:to-violet-400 bg-clip-text text-transparent">
            Discover
          </span>{" "}
          Your Next Favorite Movie
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-500 dark:text-zinc-400 max-w-xl leading-relaxed"
        >
          AI-powered recommendations tailored to your mood, powered by advanced
          neural engines.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/movies"
            className="group flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm tracking-wide transition-all duration-200 shadow-lg shadow-purple-600/30 hover:shadow-purple-700/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-white" />
            Explore Movies
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/chatbot"
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white font-bold text-sm tracking-wide border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <MessageSquare className="w-4 h-4" />
            Try AI Chatbot
          </Link>
        </motion.div>

        {/* Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="w-full mt-4"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-6">
            Browse Categories
          </p>
          <DisplayCardsDemo />
        </motion.div>
      </div>
    </AuroraBackground>
  );
}
