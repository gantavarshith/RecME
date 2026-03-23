"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Film, MessageSquare, Search, X, Bookmark, UserCircle, LogOut, LogIn, Check, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/movies", label: "Movies", icon: Film },
  { href: "/chatbot", label: "AI Chatbot", icon: MessageSquare },
  { href: "/watchlist", label: "Watchlist", icon: Bookmark },
  { href: "/watched", label: "Watched", icon: Check },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
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
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <header 
        className="sticky top-0 z-50 w-full bg-white/5 dark:bg-zinc-950/2 backdrop-blur-2xl transition-all duration-300 shadow-none border-none"
        style={{
          maskImage: "linear-gradient(to bottom, black 85%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 85%, transparent 100%)"
        }}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-2 md:gap-4">
          <div className={cn("flex items-center gap-2 md:gap-4 flex-shrink-0", isMobileSearchOpen ? "hidden xs:flex md:flex" : "flex")}>
            {/* Mobile Menu Toggle */}
            {!isMobileSearchOpen && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 -ml-2 rounded-xl md:hidden text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-white/5"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}

            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 font-black text-xl tracking-tighter text-gray-900 dark:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Film className="w-5 h-5 text-purple-500" />
              <span className={cn(isMobileSearchOpen ? "hidden lg:inline" : "inline")}>
                Rec<span className="text-purple-500">ME</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
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

          {/* Search + Theme Toggle + Actions */}
          <div className={cn("flex items-center gap-1.5 md:gap-3 justify-end", isMobileSearchOpen ? "flex-1" : "flex-shrink-0 md:flex-1 md:max-w-sm")}>
            
            {/* Desktop Search / Collapsible Mobile Search */}
            <form 
              onSubmit={handleSearch} 
              className={cn(
                "relative transition-all duration-300",
                isMobileSearchOpen ? "flex-1" : "hidden md:block md:flex-1"
              )}
            >
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                autoFocus={isMobileSearchOpen}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onBlur={() => { if(!query) setIsMobileSearchOpen(false); }}
                placeholder="Search movies..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
              {isMobileSearchOpen && (
                <button 
                  type="button" 
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 md:hidden"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            <div className={cn("flex items-center gap-1.5 md:gap-3", isMobileSearchOpen && "hidden sm:flex")}>
              {/* Mobile Search Toggle */}
              {!isMobileSearchOpen && (
                <button
                  onClick={() => setIsMobileSearchOpen(true)}
                  className="p-2 rounded-xl md:hidden text-gray-400 hover:text-purple-500 hover:bg-purple-500/10 transition-all"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}

              <ThemeToggle fixed={false} />
              
              {isAuthenticated ? (
                <div className="flex items-center gap-1.5 md:gap-3 ml-1 md:ml-2">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
                    title="My Profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-[10px] font-black uppercase">
                      {user?.name.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 hidden lg:inline">
                      {user?.name.split(" ")[0]}
                    </span>
                  </Link>
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
                  className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs md:text-sm font-bold transition-all shadow-lg shadow-purple-600/20 active:scale-95 ml-1 md:ml-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden xs:inline">Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-4/5 max-w-sm bg-white dark:bg-zinc-950 shadow-2xl md:hidden"
            >
              <div className="flex flex-col h-full p-6">
                <div className="flex items-center justify-between mb-8">
                  <Link
                    href="/"
                    className="flex items-center gap-2 font-black text-xl tracking-tighter"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Film className="w-6 h-6 text-purple-500" />
                    <span>Rec<span className="text-purple-500">ME</span></span>
                  </Link>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Mobile Search (Hidden because it's now in Navbar) */}
                {/* <form onSubmit={handleSearch} className="relative mb-8">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search movies..."
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-zinc-900"
                  />
                </form> */}

                {/* Mobile Links */}
                <nav className="flex flex-col gap-2">
                  {navLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-bold transition-all",
                        pathname === href
                          ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                          : "text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-white/5"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {label}
                    </Link>
                  ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-gray-100 dark:border-white/5">
                  <ThemeToggle fixed={false} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
