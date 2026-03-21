"use client";

import { AuroraBackground } from "@/components/ui/aurora-background";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { Bookmark, Film, Trash2, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getWatchlist, removeFromWatchlist, Movie } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function WatchlistPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchWatchlist = async () => {
      try {
        if (token) {
          const data = await getWatchlist(token);
          setMovies(data);
        }
      } catch (err) {
        console.error("Failed to fetch watchlist:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWatchlist();
  }, [isAuthenticated, token, router]);

  const handleRemove = async (movieId: string | number) => {
    if (token) {
      try {
        await removeFromWatchlist(movieId, token);
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
            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-600 dark:text-purple-400">
              <Bookmark className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                My Watchlist
              </h1>
              <p className="text-gray-500 dark:text-zinc-400">
                {movies.length} films saved to your profile
              </p>
            </div>
          </div>

          {movies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-6 bg-white/5 dark:bg-zinc-900/30 backdrop-blur-xl border border-white/10 rounded-[2rem]">
                <Film className="w-16 h-16 text-gray-300 dark:text-zinc-700" />
                <div className="space-y-2">
                    <h2 className="text-xl font-bold dark:text-white">Your list is empty</h2>
                    <p className="text-gray-500 dark:text-zinc-400 max-w-sm">
                        Start exploring our massive collection and save the films you want to watch later.
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
                <div
                  key={movie.id}
                  className="group relative bg-white/5 dark:bg-zinc-950/30 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10"
                >
                  <div className="aspect-[2/3] relative overflow-hidden">
                    {movie.poster_path ? (
                        <img
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            alt={movie.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                            <Film className="w-12 h-12 text-zinc-700" />
                        </div>
                    )}
                    <button
                        onClick={() => movie.id && handleRemove(movie.id)}
                        className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-md rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-lg bg-yellow-500/20 text-yellow-500 text-[10px] font-bold border border-yellow-500/20">
                                ⭐ {movie.vote_average?.toFixed(1)}
                            </span>
                            <span className="text-[10px] text-gray-300 font-medium">
                                {movie.release_date?.split("-")[0]}
                            </span>
                        </div>
                        <h3 className="text-white font-bold text-sm truncate">{movie.title}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </AuroraBackground>
  );
}
