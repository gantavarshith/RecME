"use client";

import { AuroraBackground } from "@/components/ui/aurora-background";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Film, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getWatched, removeFromWatched, Movie } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

import { MovieCard } from "@/components/MovieCard";

export default function WatchedPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchWatched = async () => {
      try {
        if (token) {
          const data = await getWatched(token);
          setMovies(data);
        }
      } catch (err) {
        console.error("Failed to fetch watched list:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWatched();
  }, [isAuthenticated, token, router]);

  const handleRemove = async (movieId: string | number) => {
    if (token) {
      try {
        await removeFromWatched(movieId, token);
        setMovies(movies.filter(m => m.id !== movieId));
      } catch (err) {
        console.error("Failed to remove movie:", err);
      }
    }
  };

  if (isLoading) {
    return (
      <AuroraBackground className="flex-col !justify-start !items-stretch">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
        </main>
      </AuroraBackground>
    );
  }

  return (
    <AuroraBackground className="flex-col !justify-start !items-stretch">
      <Navbar />
      <main className="flex-1 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <div className="p-3 bg-green-500/10 rounded-2xl text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                Watched Movies
              </h1>
              <p className="text-gray-500 dark:text-zinc-400">
                You've logged {movies.length} films
              </p>
            </div>
          </div>

          {movies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-6 bg-white/5 dark:bg-zinc-900/30 backdrop-blur-xl border border-white/10 rounded-[2rem]">
                <Film className="w-16 h-16 text-gray-300 dark:text-zinc-700" />
                <div className="space-y-2">
                    <h2 className="text-xl font-bold dark:text-white">Your history is empty</h2>
                    <p className="text-gray-500 dark:text-zinc-400 max-w-sm">
                        Mark movies as watched to see them here and get better recommendations.
                    </p>
                </div>
                <Link
                  href="/movies"
                  className="mt-2 flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  Explore Movies
                </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {movies.map((movie) => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  isWatchedInitial={true}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </AuroraBackground>
  );
}
