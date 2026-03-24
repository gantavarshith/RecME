"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Movie, addToWatchlist, addToNotInterested } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  ArrowLeft,
  Star,
  Calendar,
  Clock,
  Film,
  Bookmark,
  Share2,
  Play,
  Users,
  Award,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8007";

async function fetchMovieById(id: string): Promise<Movie | null> {
  // First try the numeric ID endpoint
  if (/^\d+$/.test(id)) {
    try {
      const r = await fetch(`${API_BASE}/movies/${id}`);
      if (r.ok) return r.json();
    } catch {}
  }
  // Fallback: search the recommendations
  try {
    const r = await fetch(`${API_BASE}/recommend/?user_id=1&top_k=50`);
    if (r.ok) {
      const movies: Movie[] = await r.json();
      return (
        movies.find(
          (m) =>
            m.id?.toString() === id ||
            encodeURIComponent(m.title) === id ||
            m.title === decodeURIComponent(id)
        ) ?? null
      );
    }
  } catch {}
  return null;
}

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.token);

  const handleWatchlist = async () => {
    if (!token) {
      alert("Please sign in to add to your watchlist.");
      router.push("/login");
      return;
    }
    if (!movie) return;
    
    try {
      await addToWatchlist(movie, token);
      alert(`Added ${movie.title} to your watchlist!`);
    } catch (err: any) {
      alert(err.message || "Failed to add to watchlist");
    }
  };

  const handleNotInterested = async () => {
    if (!token) {
      alert("Please sign in to manage preferences.");
      router.push("/login");
      return;
    }
    if (!movie) return;

    if (window.confirm(`Are you sure you want to hide "${movie.title}"? It won't be recommended to you again.`)) {
      try {
        await addToNotInterested(movie, token);
        router.push("/movies"); // Go back since they don't want to see this
      } catch (err: any) {
        alert(err.message || "Failed to mark as not interested");
      }
    }
  };

  useEffect(() => {
    fetchMovieById(id).then((m) => {
      setMovie(m);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent">
        <div className="animate-pulse max-w-6xl mx-auto px-4 py-10">
          <div className="h-96 rounded-3xl bg-gray-200 dark:bg-zinc-800 mb-8" />
          <div className="flex gap-8 mt-6">
            <div className="w-48 h-72 rounded-2xl bg-gray-200 dark:bg-zinc-800 flex-shrink-0" />
            <div className="flex-1 space-y-4">
              <div className="h-8 w-2/3 rounded bg-gray-200 dark:bg-zinc-800" />
              <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-zinc-800" />
              <div className="h-20 rounded bg-gray-200 dark:bg-zinc-800" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-transparent">
        <div className="flex flex-col items-center justify-center py-32 text-center px-4">
          <Film className="w-16 h-16 text-gray-300 dark:text-zinc-700 mb-4" />
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
            Movie not found
          </h2>
          <p className="text-gray-400 mb-8">
            We couldn't load details for this movie.
          </p>
          <Link
            href="/movies"
            className="px-6 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors"
          >
            Browse Movies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">

      {/* Hero Backdrop */}
      <div className="relative h-[50vh] w-full overflow-hidden">
        {movie.backdrop_path ? (
          <img
            src={movie.backdrop_path}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : movie.poster_path ? (
          <img
            src={movie.poster_path}
            alt={movie.title}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900 via-zinc-900 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-zinc-950 via-black/20 to-black/50" />
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-black/50 backdrop-blur-lg text-white text-sm font-semibold hover:bg-black/70 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 -mt-32 relative z-10 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row gap-8"
        >
          {/* Poster */}
          {movie.poster_path && (
            <div className="flex-shrink-0">
              <img
                src={movie.poster_path}
                alt={movie.title}
                className="w-44 md:w-52 rounded-2xl shadow-2xl ring-1 ring-white/10"
              />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 pt-2 md:pt-10">
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
              {movie.title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {(movie.vote_average != null && movie.vote_average > 0) && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-sm font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {movie.vote_average.toFixed(1)} TMDB
                </span>
              )}
              {(movie as any).imdb_rating && (
                <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm font-bold">
                  ⭐ {(movie as any).imdb_rating} IMDb
                </span>
              )}
              {movie.release_date && (
                <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-zinc-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(movie.release_date).getFullYear()}
                </span>
              )}
              {(movie as any).runtime && (
                <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-zinc-400">
                  <Clock className="w-3.5 h-3.5" />
                  {(movie as any).runtime} min
                </span>
              )}
              {(movie as any).rated && (
                <span className="px-2 py-0.5 text-xs font-bold rounded border border-gray-300 dark:border-zinc-600 text-gray-500 dark:text-zinc-400">
                  {(movie as any).rated}
                </span>
              )}
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {movie.genres.map((g: string) => (
                  <span
                    key={g}
                    className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            {(movie.overview || (movie as any).plot) && (
              <p className="text-gray-600 dark:text-zinc-300 leading-relaxed mb-6 text-sm md:text-base">
                {movie.overview || (movie as any).plot}
              </p>
            )}

            {/* Cast + Director */}
            {((movie as any).director || (movie as any).actors) && (
              <div className="flex flex-col gap-2 mb-6 text-sm text-gray-500 dark:text-zinc-400">
                {(movie as any).director && (
                  <span>
                    <span className="font-semibold text-gray-700 dark:text-zinc-300">Director:</span>{" "}
                    {(movie as any).director}
                  </span>
                )}
                {(movie as any).actors && (
                  <span className="flex items-start gap-1">
                    <Users className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {(movie as any).actors}
                  </span>
                )}
                {(movie as any).awards && (
                  <span className="flex items-start gap-1 text-yellow-600 dark:text-yellow-500">
                    <Award className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {(movie as any).awards}
                  </span>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' trailer')}`, '_blank')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-lg shadow-purple-600/20 hover:scale-[1.02] active:scale-95">
                <Play className="w-4 h-4 fill-white" />
                Watch Trailer
              </button>
              <button 
                onClick={handleWatchlist}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white font-bold border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-95">
                <Bookmark className="w-4 h-4" />
                Watchlist
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: movie.title, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white font-bold border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={handleNotInterested}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all hover:scale-[1.02] active:scale-95"
              >
                <XCircle className="w-4 h-4" />
                Not Interested
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
