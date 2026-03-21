"use client";

import { motion } from "framer-motion";
import { Sparkles, Film, ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";

const categories = [
  {
    title: "Featured",
    icon: <Sparkles className="w-5 h-5" />,
    href: "/movies?tag=featured",
    color: "from-purple-600/20 to-violet-500/20",
    hoverColor: "hover:from-purple-600/30 hover:to-violet-500/30",
    borderColor: "border-purple-500/20",
    textColor: "text-purple-700 dark:text-purple-300",
  },
  {
    title: "New Releases",
    icon: <Film className="w-5 h-5" />,
    href: "/movies?tag=new",
    color: "from-blue-600/20 to-cyan-500/20",
    hoverColor: "hover:from-blue-600/30 hover:to-cyan-500/30",
    borderColor: "border-blue-500/20",
    textColor: "text-blue-700 dark:text-blue-300",
  },
];

export function CategoryButtons() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 w-full max-w-4xl mx-auto">
      {categories.map((cat, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * idx }}
          className="flex-1 min-w-[280px]"
        >
          <Link
            href={cat.href}
            className={`
              group relative flex items-center justify-between p-6 rounded-3xl 
              bg-gradient-to-br ${cat.color} ${cat.hoverColor}
              border ${cat.borderColor} backdrop-blur-xl
              transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
              shadow-xl shadow-black/5 dark:shadow-none
            `}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl bg-white/50 dark:bg-black/20 ${cat.textColor} shadow-inner`}>
                {cat.icon}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Browse</p>
                <h3 className={`text-xl font-black tracking-tight ${cat.textColor}`}>
                  {cat.title}
                </h3>
              </div>
            </div>
            <div className={`p-2 rounded-full bg-white/50 dark:bg-black/20 ${cat.textColor} opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0`}>
              <ArrowRight className="w-5 h-5" />
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
