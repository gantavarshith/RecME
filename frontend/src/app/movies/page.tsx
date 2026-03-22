"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { searchMovies, getMoodRecommendations, getRecommendations, getMoviesByTag, Movie, getWatched } from "@/lib/api";
import { Search, Sparkles, TrendingUp, X, Shuffle, Film } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { MovieCard } from "@/components/MovieCard";
import { MovieOfTheDay } from "@/components/MovieOfTheDay";

const MOODS = [
  { label: "Happy 😊", value: "happy" },
  { label: "Sad 😢", value: "sad" },
  { label: "Action 💥", value: "action" },
  { label: "Spooky 👻", value: "horror" },
  { label: "Romantic 💕", value: "romance" },
  { label: "Funny 😂", value: "comedy" },
];

function MovieGrid({ 
  movies, 
  loading,
  watchedIds,
  onWatchedChange
}: { 
  movies: Movie[]; 
  loading: boolean;
  watchedIds?: Set<string | number>;
  onWatchedChange?: (id: string | number, watched: boolean) => void;
}) {

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[2/3] rounded-2xl bg-gray-200 dark:bg-zinc-800 mb-3" />
            <div className="h-3 rounded bg-gray-200 dark:bg-zinc-800 mb-2 w-3/4" />
            <div className="h-2.5 rounded bg-gray-200 dark:bg-zinc-800 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-zinc-500 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl">
        <Film className="w-12 h-12 mb-4 opacity-40" />
        <p className="font-medium">No movies found.</p>
        <p className="text-sm mt-1">Try a different search or mood.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {movies.map((movie, i) => (
        <motion.div
          key={`${movie.id}-${i}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: i * 0.02 }}
          className="h-full"
        >
          <MovieCard 
            movie={movie} 
            isWatchedInitial={watchedIds?.has(movie.id as string | number)}
            onWatchedChange={onWatchedChange}
          />
        </motion.div>
      ))}
    </div>
  );
}

function MoviesContent() {
  const { token, isAuthenticated } = useAuthStore();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const tag = searchParams.get("tag") || "";
  
  // Search state
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Recommendations state
  const [recMovies, setRecMovies] = useState<Movie[]>([]);
  const [recLoading, setRecLoading] = useState(true);
  const [recShuffleKey, setRecShuffleKey] = useState(0);

  // Mood state
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const [moodMovies, setMoodMovies] = useState<Movie[]>([]);
  const [moodLoading, setMoodLoading] = useState(false);
  const [moodShuffleKey, setMoodShuffleKey] = useState(0);

  // Tag state
  const [tagMovies, setTagMovies] = useState<Movie[]>([]);
  const [tagLoading, setTagLoading] = useState(false);

  // Watched state
  const [watchedIds, setWatchedIds] = useState<Set<string | number>>(new Set());

  // Fetch watched IDs
  useEffect(() => {
    if (isAuthenticated && token) {
      getWatched(token).then(data => {
        setWatchedIds(new Set(data.map(m => m.id as string | number)));
      }).catch(console.error);
    }
  }, [isAuthenticated, token]);

  const handleWatchedChange = (id: string | number, watched: boolean) => {
    setWatchedIds(prev => {
      const next = new Set(prev);
      if (watched) next.add(id);
      else next.delete(id);
      return next;
    });
  };


  // Load Search Results
  useEffect(() => {
    if (!q) return;
    let cancelled = false;
    setSearchLoading(true);
    searchMovies(q).then((data) => {
      if (!cancelled) {
        setSearchResults(data);
        setSearchLoading(false);
      }
    }).catch(() => {
      if (!cancelled) {
        setSearchResults([]);
        setSearchLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [q]);

  // Load General Recommendations
  useEffect(() => {
    if (q) return; // Don't load if searching
    let cancelled = false;
    setRecLoading(true);
    getRecommendations("1", 12).then((data) => {
      if (!cancelled) {
        setRecMovies(data);
        setRecLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setRecLoading(false);
    });
    return () => { cancelled = true; };
  }, [q, recShuffleKey]);

  // Load Mood Recommendations
  useEffect(() => {
    if (!activeMood || q) return;
    let cancelled = false;
    setMoodLoading(true);
    getMoodRecommendations(activeMood).then((data) => {
      if (!cancelled) {
        setMoodMovies(data);
        setMoodLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setMoodLoading(false);
    });
    return () => { cancelled = true; };
  }, [activeMood, moodShuffleKey, q]);

  // Load Tagged Movies
  useEffect(() => {
    if (!tag || q) return;
    let cancelled = false;
    setTagLoading(true);
    getMoviesByTag(tag).then((data) => {
      if (!cancelled) {
        setTagMovies(data);
        setTagLoading(false);
      }
    }).catch(() => {
      if (!cancelled) {
        setTagMovies([]);
        setTagLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [tag, q]);

  const handleMoodClick = (moodValue: string) => {
    if (activeMood === moodValue) {
      // User tapped the active mood again -> Shuffle the mood films!
      setMoodShuffleKey(k => k + 1);
    } else {
      setActiveMood(moodValue);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-16">
        
        {/* SEARCH RESULTS VIEW */}
        {q && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  Search Results for "{q}"
                </h1>
                <p className="text-sm text-gray-500 mt-1">Found {searchResults.length} matches</p>
              </div>
              <Link
                href="/movies"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-200 dark:bg-zinc-800 text-sm font-semibold hover:bg-gray-300 dark:hover:bg-zinc-700 transition"
              >
                <X className="w-4 h-4" /> Clear Search
              </Link>
            </div>
            <MovieGrid 
              movies={searchResults} 
              loading={searchLoading} 
              watchedIds={watchedIds}
              onWatchedChange={handleWatchedChange}
            />

          </section>
        )}

        {/* DEFAULT BROWSE VIEW */}
        {!q && (
          <>
            {/* MOVIE OF THE DAY */}
            {!tag && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    🎬 Movie of the Day
                  </h2>
                </div>
                <MovieOfTheDay />
              </section>
            )}

            {/* TAGGED MOVIES SECTION (IF TAG ACTIVE) */}
            {tag && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight capitalize">
                      {tag === "new" ? "New Releases" : tag} Movies
                    </h1>
                  </div>
                  <Link
                    href="/movies"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-200 dark:bg-zinc-800 text-sm font-semibold hover:bg-gray-300 dark:hover:bg-zinc-700 transition"
                  >
                    <X className="w-4 h-4" /> Clear Filter
                  </Link>
                </div>
                <MovieGrid 
                  movies={tagMovies} 
                  loading={tagLoading} 
                  watchedIds={watchedIds}
                  onWatchedChange={handleWatchedChange}
                />

                <div className="mt-12 mb-8">
                  <hr className="border-gray-200 dark:border-zinc-800/50" />
                </div>
              </section>
            )}

            {/* RECOMMENDED FOR YOU SECTION */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    Recommended For You
                  </h2>
                </div>
                <button
                  onClick={() => setRecShuffleKey((k) => k + 1)}
                  disabled={recLoading}
                  className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50"
                  title="Shuffle recommendations"
                >
                  <Shuffle className="w-4 h-4" />
                  Shuffle
                </button>
              </div>
              <MovieGrid movies={recMovies} loading={recLoading} />
            </section>

            <hr className="border-gray-200 dark:border-zinc-800/50" />

            {/* BROWSE BY MOOD SECTION */}
            <section>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    Explore Exact Moods
                  </h2>
                </div>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">
                  Select a mood to see exactly matched films. Tap it again to shuffle!
                </p>
                <div className="flex flex-wrap gap-3">
                  {MOODS.map((m) => {
                    const isActive = activeMood === m.value;
                    return (
                      <button
                        key={m.value}
                        onClick={() => handleMoodClick(m.value)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                          isActive
                            ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-purple-600/25 scale-105"
                            : "bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-white/5 hover:border-pink-300 dark:hover:border-pink-900/50 hover:bg-pink-50 dark:hover:bg-pink-900/10"
                        }`}
                      >
                        {m.label}
                        {isActive && <Shuffle className="w-3.5 h-3.5 opacity-80" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Display exact mood movies below the chips if one is active */}
              {activeMood && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeMood}-${moodShuffleKey}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="mt-8"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Curated for {MOODS.find(m => m.value === activeMood)?.label.split(" ")[0]}
                      </h3>
                    </div>
                    <MovieGrid 
                    movies={moodMovies} 
                    loading={moodLoading} 
                    watchedIds={watchedIds}
                    onWatchedChange={handleWatchedChange}
                  />

                  </motion.div>
                </AnimatePresence>
              )}
            </section>
          </>
        )}

      </div>
    </main>
  );
}

export default function MoviesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-zinc-950" />}>
      <MoviesContent />
    </Suspense>
  );
}
