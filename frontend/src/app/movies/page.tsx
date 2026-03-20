"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { searchMovies, getMoodRecommendations, getRecommendations, Movie } from "@/lib/api";
import { Search, Sparkles, TrendingUp, Star, Film, X, Shuffle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";

const MOODS = [
  { label: "Happy 😊", value: "happy" },
  { label: "Sad 😢", value: "sad" },
  { label: "Action 💥", value: "action" },
  { label: "Spooky 👻", value: "horror" },
  { label: "Romantic 💕", value: "romance" },
  { label: "Funny 😂", value: "comedy" },
];

function MovieCard({ movie }: { movie: Movie }) {
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
        className="group relative bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-900/50 transition-all duration-300 cursor-pointer h-full"
      >
        <div className="relative aspect-[2/3] overflow-hidden bg-gray-100 dark:bg-zinc-800">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-zinc-600">
              <Film className="w-12 h-12" />
            </div>
          )}
          {(movie.vote_average || movie.tmdb_score) && (
            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-yellow-400 text-xs font-bold">
              <Star className="w-3 h-3 fill-yellow-400" />
              {((movie.vote_average || movie.tmdb_score) as number).toFixed(1)}
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col justify-between h-[120px]">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1 mb-1">
              {movie.title}
            </h3>
            {movie.release_date && (
              <p className="text-xs text-gray-400 dark:text-zinc-500">
                {new Date(movie.release_date).getFullYear()}
              </p>
            )}
            {movie.overview && (
              <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 mt-2">
                {movie.overview}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function MovieGrid({ movies, loading }: { movies: Movie[]; loading: boolean }) {
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
          <MovieCard movie={movie} />
        </motion.div>
      ))}
    </div>
  );
}

function MoviesContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  
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
            <MovieGrid movies={searchResults} loading={searchLoading} />
          </section>
        )}

        {/* DEFAULT BROWSE VIEW */}
        {!q && (
          <>
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
                    <MovieGrid movies={moodMovies} loading={moodLoading} />
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
