"use client";

import { useState } from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, Chrome } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { loginUser, googleLogin } from "@/lib/api";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const data = await loginUser(formData);
      setAuth(data.user, data.access_token);
      router.push("/");
    } catch (err: any) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const data = await googleLogin(credentialResponse.credential);
      setAuth(data.user, data.access_token);
      router.push("/");
    } catch (err) {
      setError("Google login failed. Please try again.");
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6">
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-8 bg-white/5 dark:bg-zinc-950/30 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-500 dark:text-zinc-400">
              Sign in to access your personalized movies
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-zinc-300 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none transition"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-zinc-300 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none transition"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 transition flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-gray-500 dark:text-zinc-500 backdrop-blur-3xl">
                Or continue with
              </span>
            </div>
          </div>

          <div className="flex justify-center flex-col items-center gap-4">
             <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google login failed")}
                theme="filled_black"
                shape="pill"
                width="100%"
              />
          </div>

          <p className="mt-8 text-center text-sm text-gray-500 dark:text-zinc-400">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-purple-600 hover:text-purple-500 font-bold underline underline-offset-4"
            >
              Join RecME
            </Link>
          </p>
      </motion.div>
    </main>
  );
}
