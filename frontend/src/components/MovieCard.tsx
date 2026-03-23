"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Film, Bookmark, Check, Eye, Loader2, Trash2, XCircle } from "lucide-react";
import Link from "next/link";
import { Movie, addToWatchlist, addToWatched, addToNotInterested } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

interface MovieCardProps {
  movie: Movie;
  isWatchedInitial?: boolean;
  onWatchedChange?: (id: string | number, watched: boolean) => void;
  onNotInterestedChange?: (id: string | number) => void;
  onRemove?: (id: string | number) => void;
  showActions?: boolean;
}

export function MovieCard({ 
  movie, 
  isWatchedInitial = false, 
  onWatchedChange,
  onNotInterestedChange,
  onRemove,
  showActions = true
}: MovieCardProps) {
  const { token, isAuthenticated } = useAuthStore();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isWatched, setIsWatched] = useState(isWatchedInitial);
  const [isWatching, setIsWatching] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setIsWatched(isWatchedInitial);
  }, [isWatchedInitial]);

  const handleAddToWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
        window.location.href = "/login";
        return;
    }

    if (token) {
        setIsSaving(true);
        try {
            await addToWatchlist(movie, token);
            setIsSaved(true);
            toast.success(`" ${movie.title} " added to Watchlist 🎬`);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (err) {
            console.error("Failed to add to watchlist", err);
            toast.error(`Could not add "${movie.title}" to watchlist.`);
        } finally {
            setIsSaving(false);
        }
    }
  };

  const handleToggleWatched = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
        window.location.href = "/login";
        return;
    }

    if (token && movie.id) {
        setIsWatching(true);
        try {
            if (!isWatched) {
                await addToWatched(movie, token);
                setIsWatched(true);
                toast.success(`Marked " ${movie.title} " as Watched ✅`);
                if (onWatchedChange) onWatchedChange(movie.id, true);
                
                // If we are in the watchlist (indicated by onRemove being present),
                // we should remove it from the UI since the backend already removed it from the watchlist collection.
                if (onRemove) {
                    onRemove(movie.id);
                }
            }
        } catch (err) {
            console.error("Failed to update watched status", err);
            toast.error(`Could not mark "${movie.title}" as watched.`);
        } finally {
            setIsWatching(false);
        }
    }
  };

  const handleNotInterested = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
        window.location.href = "/login";
        return;
    }

    if (token && movie.id) {
        try {
            await addToNotInterested(movie, token);
            toast.info(`Moved " ${movie.title} " to Not Interested 🚫`);
            if (onNotInterestedChange) onNotInterestedChange(movie.id);
        } catch (err) {
            console.error("Failed to mark as not interested", err);
            toast.error(`Could not update preference for "${movie.title}".`);
        }
    }
  };

  const handleRemoveAction = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemove && movie.id) {
        setIsRemoving(true);
        try {
            await onRemove(movie.id);
        } finally {
            setIsRemoving(false);
        }
    }
  }

  const movieId = movie.id?.toString() || encodeURIComponent(movie.title);
  const posterUrl = movie.poster_path
    ? movie.poster_path.startsWith("http")
      ? movie.poster_path
      : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  return (
    <Link href={`/movies/${movieId}`}>
      <motion.div
        whileHover={{ y: -6, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`group relative bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-900/50 transition-all duration-300 cursor-pointer h-full ${isWatched ? 'opacity-60 saturate-50' : ''}`}
      >
        <div className="relative aspect-[2/3] overflow-hidden bg-gray-100 dark:bg-zinc-800">
          {!imageLoaded && posterUrl && (
            <Skeleton className="absolute inset-0 z-10 w-full h-full" />
          )}
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={movie.title}
              onLoad={() => setImageLoaded(true)}
              className={cn(
                "w-full h-full object-cover transition-all duration-700 group-hover:scale-105",
                !imageLoaded ? "opacity-0 scale-110 blur-sm" : "opacity-100 scale-100 blur-0"
              )}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-zinc-600">
              <Film className="w-12 h-12" />
            </div>
          )}
          
          {/* Status Badge */}
          {isWatched && (
            <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                <Check className="w-3 h-3" />
                Watched
            </div>
          )}

          {!isWatched && (movie.vote_average || movie.tmdb_score) && (
            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-yellow-400 text-xs font-bold">
              <Star className="w-3 h-3 fill-yellow-400" />
              {((movie.vote_average || movie.tmdb_score) as number).toFixed(1)}
            </div>
          )}

          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {onRemove && (
                <div className="flex flex-col gap-2">
                    <button
                        onClick={handleToggleWatched}
                        disabled={isWatching || isWatched}
                        className={`p-2 rounded-xl transition-all ${
                            isWatched 
                            ? "bg-green-500 text-white" 
                            : "bg-black/60 backdrop-blur-md text-white hover:bg-green-600"
                        }`}
                        title="Mark as Watched"
                    >
                        {isWatching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={handleRemoveAction}
                        disabled={isRemoving}
                        className="p-2 bg-black/60 backdrop-blur-md rounded-xl text-white hover:bg-red-600 transition-colors"
                        title="Remove from List"
                    >
                        {isRemoving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                </div>
            )}

            {showActions && !onRemove && (
              <>
                <button
                    onClick={handleAddToWatchlist}
                    disabled={isSaving}
                    className={`p-2 rounded-xl transition-all ${
                        isSaved 
                        ? "bg-green-500 text-white" 
                        : "bg-black/60 backdrop-blur-sm text-white hover:bg-purple-600"
                    }`}
                    title="Add to Watchlist"
                >
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        isSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />
                    )}
                </button>

                <button
                    onClick={handleToggleWatched}
                    disabled={isWatching || isWatched}
                    className={`p-2 rounded-xl transition-all ${
                        isWatched 
                        ? "bg-green-500 text-white" 
                        : "bg-black/60 backdrop-blur-sm text-white hover:bg-green-600"
                    }`}
                    title={isWatched ? "Watched" : "Mark as Watched"}
                >
                    {isWatching ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Eye className="w-4 h-4" />
                    )}
                </button>

                <button
                    onClick={handleNotInterested}
                    className="p-2 bg-black/60 backdrop-blur-sm rounded-xl text-white hover:bg-red-500 transition-colors"
                    title="Not Interested"
                >
                    <XCircle className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
            <h3 className="text-white font-bold text-sm truncate">{movie.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-gray-300">
                {movie.release_date?.split("-")[0] || "N/A"}
              </span>
              <span className="text-[10px] text-gray-400">•</span>
              <span className="text-[10px] text-gray-300">
                {movie.genres?.[0] || movie.genre_ids?.[0] || "Movie"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
