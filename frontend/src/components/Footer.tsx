"use client";

import { useState } from "react";
import Link from "next/link";
import { Film, Github, Twitter, Linkedin, Mail, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Footer() {
  const [showEmail, setShowEmail] = useState(false);
  
  // Basic obfuscation to prevent scraping
  const emailUser = "reddyvaru12";
  const emailDomain = "gmail.com";

  const handleContactClick = () => {
    if (!showEmail) {
      setShowEmail(true);
    } else {
      window.location.href = `mailto:${emailUser}@${emailDomain}`;
    }
  };

  return (
    <footer className="relative z-10 bg-transparent border-t border-gray-100 dark:border-white/5 overflow-hidden">
      {/* Decorative gradient for dark mode premium feel */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent dark:via-purple-500/10" />
      
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">
          
          {/* Brand & Mission Section */}
          <div className="lg:col-span-4 space-y-8">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative p-2.5 bg-purple-600 rounded-2xl shadow-lg shadow-purple-600/20 group-hover:scale-105 active:scale-95 transition-all">
                  <Film className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white">
                Rec<span className="text-purple-600">ME</span>
              </span>
            </Link>
            
            <p className="text-base text-gray-500 dark:text-zinc-400 leading-relaxed max-w-sm">
              The next generation of movie discovery. Powered by AI to understand 
              your mood and deliver recommendations that actually hit the spot.
            </p>

            <div className="flex items-center gap-3">
              {[
                { icon: Github, label: "GitHub", href: "https://github.com" },
                { icon: Twitter, label: "Twitter", href: "https://twitter.com" },
                { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
              ].map((social) => (
                <a 
                  key={social.label}
                  href={social.href} 
                  target="_blank" 
                  rel="noreferrer" 
                  aria-label={social.label}
                  className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-zinc-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all hover:scale-110 active:scale-90"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 lg:ml-auto">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-6">Explore</h3>
            <ul className="space-y-4">
              {[
                { name: "Global Browse", href: "/movies" },
                { name: "My Watchlist", href: "/watchlist" },
                { name: "Watched History", href: "/watched" },
                { name: "AI Chatbot", href: "/chatbot" },
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm font-semibold text-gray-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center group w-fit">
                    {link.name}
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all text-purple-500" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Section */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-6">Support</h3>
            <ul className="space-y-4">
              {[
                "FAQs",
                "API Documentation",
                "Release Notes",
                "Community Forum"
              ].map((item) => (
                <li key={item}>
                  <button className="text-sm font-semibold text-gray-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Dynamic Contact Card */}
          <div className="lg:col-span-4">
            <div className="p-6 rounded-3xl bg-white/40 dark:bg-white/5 backdrop-blur-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500/10 dark:bg-purple-500/5 blur-3xl rounded-full" />
              
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Connect with us</h3>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6 leading-relaxed">
                Want to collaborate or share feedback?
              </p>
              
              <button
                onClick={handleContactClick}
                className="relative flex items-center justify-between w-full px-5 py-3.5 rounded-2xl bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md border border-gray-100 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-900 shadow-sm hover:shadow-lg hover:shadow-purple-500/5 transition-all group/btn"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                    {showEmail ? `${emailUser}@${emailDomain}` : "Drop an Email"}
                  </span>
                </div>
                <ArrowUpRight className={cn(
                  "w-4 h-4 text-gray-400 transition-all",
                  showEmail ? "rotate-45 text-purple-500" : "group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                )} />
              </button>
            </div>
          </div>
        </div>

        {/* Branding & Legal Footer Strip */}
        <div className="pt-10 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-center md:text-left">
            <p className="text-sm font-medium text-gray-400 dark:text-zinc-600">
              © {new Date().getFullYear()} RecME.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Terms
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-tighter">System Status: Optimal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
