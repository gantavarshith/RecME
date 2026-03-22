"use client";

import { useState } from "react";
import Link from "next/link";
import { Film, Github, Twitter, Linkedin, Mail, ArrowUpRight } from "lucide-react";

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
    <footer className="bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group w-fit">
              <div className="p-2 bg-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
                Rec<span className="text-purple-600">ME</span>
              </span>
            </Link>
            <p className="text-gray-500 dark:text-zinc-400 mb-6 max-w-sm leading-relaxed">
              Discover movies you'll love with AI. 
              Your intelligent companion for personalized film recommendations and mood-based discovery.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" className="p-2 rounded-full bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" className="p-2 rounded-full bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="p-2 rounded-full bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Navigation</h3>
            <ul className="space-y-3">
              {[
                { name: "Home", href: "/" },
                { name: "Recommendations", href: "/movies" },
                { name: "Watchlist", href: "/watchlist" },
                { name: "Watched", href: "/watched" },

              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-500 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm flex items-center group w-fit">
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-1 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Features</h3>
            <ul className="space-y-3">
              {[
                "AI Recommendations",
                "Mood-based suggestions",
                "Chatbot assistant",
                "Trending movies"
              ].map((feature) => (
                <li key={feature} className="text-gray-500 dark:text-zinc-400 text-sm">
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Contact</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mb-4">
              Have questions? Reach out to us directly.
            </p>
            <button
              onClick={handleContactClick}
              className="group flex items-center justify-between w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-purple-500 dark:hover:border-purple-500 bg-gray-50 dark:bg-zinc-900 transition-all text-sm text-left"
            >
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                <span className="font-medium text-gray-700 dark:text-zinc-300">
                  {showEmail ? `${emailUser}@${emailDomain}` : "Contact Me"}
                </span>
              </div>
              <ArrowUpRight className={`w-4 h-4 text-gray-400 transition-transform ${showEmail ? 'rotate-45 text-purple-500' : 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5'}`} />
            </button>
          </div>

        </div>

        {/* Legal / Bottom Strip */}
        <div className="pt-8 border-t border-gray-100 dark:border-zinc-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-zinc-500">
            © {new Date().getFullYear()} RecME. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-zinc-500">
            <Link href="/privacy" className="hover:text-purple-600 dark:hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-purple-600 dark:hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
