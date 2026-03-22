"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Shield } from "lucide-react";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    content: [
      "**Account Information:** When you sign up, we collect your name and email address. If you use Google Sign-In, we receive your name and email from Google.",
      "**Usage Data:** We store your watchlist and watched history to power personalised recommendations.",
      "**Authentication Tokens:** We use secure HTTP-only cookies to keep you signed in. We do not store plain-text passwords — only bcrypt-hashed versions.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    content: [
      "To provide personalised movie recommendations powered by our AI engine.",
      "To sync your watchlist and watched history across sessions.",
      "To power the Movie of the Day feature with a personalised daily pick.",
      "We never sell, rent, or share your personal information with third parties for marketing purposes.",
    ],
  },
  {
    title: "3. Third-Party Services",
    content: [
      "**TMDB (The Movie Database):** Movie metadata, posters, and backdrop images are fetched from TMDB's public API. Your personal data is never shared with TMDB.",
      "**OMDb:** Movie ratings and additional metadata are sourced from OMDb.",
      "**Google OAuth:** If you choose to sign in with Google, your name and email are shared with us by Google per their OAuth terms.",
    ],
  },
  {
    title: "4. Data Storage & Security",
    content: [
      "Your data is stored in a MongoDB database. Access is restricted and protected by authentication.",
      "Passwords are hashed using bcrypt before storage — we never store plain-text passwords.",
      "We use HTTPS for all data transmission between your browser and our servers.",
    ],
  },
  {
    title: "5. Your Rights",
    content: [
      "**Access:** You can view your profile information at any time from the Profile page.",
      "**Correction:** You can update your display name from your Profile page.",
      "**Deletion:** You can permanently delete your account and all associated data (watchlist, watched history) from the Danger Zone in your Profile page.",
    ],
  },
  {
    title: "6. Cookies",
    content: [
      "We use a single HTTP-only session cookie to keep you authenticated. This cookie contains a JWT and expires after 7 days.",
      "We do not use tracking cookies, advertising cookies, or third-party analytics cookies.",
    ],
  },
  {
    title: "7. Changes to This Policy",
    content: [
      "We may update this Privacy Policy occasionally. Changes will be reflected on this page. Significant changes will be communicated via the platform.",
    ],
  },
  {
    title: "8. Contact",
    content: [
      "If you have any questions about this Privacy Policy, please contact us at reddyvaru12@gmail.com.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 py-14 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Privacy Policy
            </h1>
          </div>
          <p className="text-sm text-gray-400 dark:text-zinc-500 mb-10">
            Effective date: March 22, 2026 · Last updated: March 22, 2026
          </p>

          <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed mb-10">
            RecME (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
            This policy explains what data we collect, how we use it, and the rights you have
            over your information.
          </p>

          <div className="space-y-8">
            {SECTIONS.map((section) => (
              <div key={section.title} className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-white/5 p-6 shadow-sm">
                <h2 className="text-base font-black text-gray-900 dark:text-white mb-4">
                  {section.title}
                </h2>
                <ul className="space-y-2">
                  {section.content.map((item, i) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                      {item.split("**").map((part, j) =>
                        j % 2 === 1
                          ? <strong key={j} className="text-gray-900 dark:text-white font-semibold">{part}</strong>
                          : <span key={j}>{part}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
