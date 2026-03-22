"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Star,
  Clock,
  Calendar,
  Bookmark,
  Eye,
  Loader2,
  Check,
  Flame,
} from "lucide-react";
import Link from "next/link";
import { Movie, getMovieOfTheDay, addToWatchlist, addToWatched } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

function MotdSkeleton() {
  return (
    <div className="relative w-full rounded-3xl overflow-hidden h-72 md:h-80 bg-zinc-200 dark:bg-zinc-800 animate-pulse">
      <div className="absolute inset-0 flex items-end p-6 gap-5">
        <div className="w-28 md:w-36 shrink-0 aspect-[2/3] rounded-2xl bg-zinc-300 dark:bg-zinc-700" />
        <div className="flex-1 space-y-3">
          <div className="h-3 w-24 rounded bg-zinc-300 dark:bg-zinc-700" />
          <div className="h-6 w-2/3 rounded bg-zinc-300 dark:bg-zinc-700" />
          <div className="h-4 w-full rounded bg-zinc-300 dark:bg-zinc-700" />
          <div className="h-4 w-3/4 rounded bg-zinc-300 dark:bg-zinc-700" />
          <div className="flex gap-2 pt-2">
            <div className="h-9 w-28 rounded-xl bg-zinc-300 dark:bg-zinc-700" />
            <div className="h-9 w-9 rounded-xl bg-zinc-300 dark:bg-zinc-700" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function MovieOfTheDay() {
  const { token, isAuthenticated } = useAuthStore();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [isWatching, setIsWatching] = useState(false);

  useEffect(() => {
    setLoading(true);
    getMovieOfTheDay(token ?? undefined)
      .then((data) => {
        setMovie(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const handleAddToWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { window.location.href = "/login"; return; }
    if (!token || !movie) return;
    setIsSaving(true);
    try {
      await addToWatchlist(movie, token);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkWatched = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { window.location.href = "/login"; return; }
    if (!token || !movie || isWatched) return;
    setIsWatching(true);
    try {
      await addToWatched(movie, token);
      setIsWatched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsWatching(false);
    }
  };

  if (loading) return <MotdSkeleton />;
  if (!movie) return null;

  const movieId = movie.id?.toString() ?? encodeURIComponent(movie.title);
  const posterUrl = movie.poster_path?.startsWith("http")
    ? movie.poster_path
    : movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;
  const backdropUrl = (movie as any).backdrop_path?.startsWith("http")
    ? (movie as any).backdrop_path
    : (movie as any).backdrop_path
    ? `https://image.tmdb.org/t/p/original${(movie as any).backdrop_path}`
    : null;

  const year = movie.release_date?.split("-")[0];
  const runtime = (movie as any).runtime;
  const imdbRating = (movie as any).imdb_rating;
  const director = (movie as any).director;
  const genres: string[] = movie.genres ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full rounded-3xl overflow-hidden shadow-2xl"
      style={{ minHeight: "22rem" }}
    >
      {/* Backdrop */}
      {backdropUrl ? (
        <img
          src={backdropUrl}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-zinc-900 to-black" />
      )}

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex items-end gap-5 md:gap-7 p-5 md:p-8 h-full min-h-[22rem]">
        {/* Poster */}
        {posterUrl && (
          <Link href={`/movies/${movieId}`} className="shrink-0 hidden sm:block">
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-28 md:w-36 rounded-2xl shadow-2xl ring-2 ring-white/10 hover:ring-purple-400/60 transition-all duration-300 hover:scale-105"
            />
          </Link>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0 pb-1">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-[10px] font-black uppercase tracking-widest mb-3">
            <Flame className="w-3 h-3 fill-orange-400 text-orange-400" />
            Movie of the Day
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight mb-2 line-clamp-2">
            {movie.title}
          </h2>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-300 mb-2">
            {year && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {year}
              </span>
            )}
            {runtime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {runtime} min
              </span>
            )}
            {(movie.vote_average ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-yellow-400 font-bold">
                <Star className="w-3 h-3 fill-yellow-400" />
                {(movie.vote_average as number).toFixed(1)} TMDB
              </span>
            )}
            {imdbRating && (
              <span className="flex items-center gap-1 text-yellow-300 font-bold">
                <Star className="w-3 h-3 fill-yellow-300" />
                {imdbRating} IMDb
              </span>
            )}
          </div>

          {/* Genres */}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {genres.slice(0, 3).map((g) => (
                <span
                  key={g}
                  className="px-2 py-0.5 rounded-md bg-white/10 text-white/70 text-[10px] font-semibold uppercase tracking-wide"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Overview */}
          <p className="text-sm text-gray-300 line-clamp-2 mb-1 max-w-xl">
            {(movie as any).plot || movie.overview}
          </p>

          {/* Director */}
          {director && (
            <p className="text-xs text-gray-400 mb-4">
              Directed by <span className="text-white font-semibold">{director}</span>
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href={`/movies/${movieId}`}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold transition-all duration-200 shadow-lg shadow-purple-600/30 hover:scale-[1.03] active:scale-[0.97]"
            >
              View Details
            </Link>

            <button
              onClick={handleAddToWatchlist}
              disabled={isSaving || isSaved}
              title="Add to Watchlist"
              className={`p-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                isSaved
                  ? "bg-green-500 text-white"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
              }`}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isSaved ? (
                <Check className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={handleMarkWatched}
              disabled={isWatching || isWatched}
              title={isWatched ? "Watched" : "Mark as Watched"}
              className={`p-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                isWatched
                  ? "bg-green-500 text-white"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
              }`}
            >
              {isWatching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
