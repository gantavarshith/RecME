"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0.3 }}
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ 
        repeat: Infinity, 
        duration: 1.5, 
        ease: "easeInOut" 
      }}
      className={cn(
        "bg-gray-200 dark:bg-zinc-800 rounded-lg overflow-hidden relative",
        className
      )}
    >
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg]"
        style={{
          animation: "shimmer 2s infinite",
          width: "200%",
        }}
      />
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-20deg); }
          100% { transform: translateX(100%) skewX(-20deg); }
        }
      `}</style>
    </motion.div>
  );
}
