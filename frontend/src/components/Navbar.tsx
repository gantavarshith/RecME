"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Film, MessageSquare, Search, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const navLinks = [
  { href: "/movies", label: "Movies" },
  { href: "/chatbot", label: "AI Chatbot", icon: MessageSquare },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/movies?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-black text-xl tracking-tighter text-gray-900 dark:text-white flex-shrink-0"
        >
          <Film className="w-5 h-5 text-purple-500" />
          Rec<span className="text-purple-500">ME</span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                pathname === href
                  ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                  : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Search + Theme Toggle */}
        <div className="flex items-center gap-3 flex-1 justify-end max-w-sm">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </form>
          <ThemeToggle fixed={false} />
        </div>
      </div>
    </header>
  );
}
