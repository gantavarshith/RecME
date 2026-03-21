"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Film, MessageSquare, Search, X, Bookmark, UserCircle, LogOut, LogIn } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";

const navLinks = [
  { href: "/movies", label: "Movies" },
  { href: "/chatbot", label: "AI Chatbot", icon: MessageSquare },
  { href: "/watchlist", label: "Watchlist", icon: Bookmark },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/movies?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  return (
    <header 
      className="sticky top-0 z-40 w-full bg-white/5 dark:bg-zinc-950/2 backdrop-blur-2xl transition-all duration-300 shadow-none border-none"
      style={{
        maskImage: "linear-gradient(to bottom, black 85%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, black 85%, transparent 100%)"
      }}
    >
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
          
          {isAuthenticated ? (
            <div className="flex items-center gap-3 ml-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-[10px] font-black uppercase">
                  {user?.name.charAt(0)}
                </div>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 hidden lg:inline">
                  {user?.name.split(" ")[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold transition-all shadow-lg shadow-purple-600/20 active:scale-95 ml-2"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
