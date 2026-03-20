import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { searchMovies } from '../services/api';
import { ArrowLeft, Star, Clock, Calendar, Play, Plus, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

const MovieDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMovie = async () => {
            // In a real app, we'd have a getMovieById endpoint.
            // For now, we'll use search as a proxy or just simulate data.
            // Since we don't have getMovieById, let's assume the ID is the title for this demo
            // or we'd need to update api.js.
            setLoading(true);
            setTimeout(() => {
                setMovie({
                    id,
                    title: id.replace(/-/g, ' '),
                    overview: "This is a detailed overview of the movie. It explores the themes of discovery, friendship, and the human condition in a way that resonates with audiences globally.",
                    poster_path: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1000",
                    backdrop_path: "https://images.unsplash.com/photo-1440404653325-ab127d499117?auto=format&fit=crop&q=80&w=2000",
                    vote_average: 8.5,
                    release_date: "2024-05-15",
                    runtime: 124,
                    genres: ["Drama", "Sci-Fi", "Adventure"]
                });
                setLoading(false);
            }, 800);
        };
        fetchMovie();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white font-mono text-purple-600 tracking-widest animate-pulse">
            LOADING EXPERIENCE...
        </div>
    );

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-white"
        >
            {/* Hero Header */}
            <div className="relative h-[60vh] overflow-hidden">
                <div className="absolute inset-0">
                    <img src={movie.backdrop_path} alt={movie.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent"></div>
                </div>
                
                <button 
                    onClick={() => navigate(-1)}
                    className="absolute top-8 left-8 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all z-10"
                >
                    <ArrowLeft size={24} />
                </button>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-10 pb-20">
                <div className="flex flex-col md:flex-row gap-12">
                    {/* Poster */}
                    <motion.div 
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-full md:w-80 flex-shrink-0"
                    >
                        <img 
                            src={movie.poster_path} 
                            alt={movie.title} 
                            className="w-full rounded-3xl shadow-2xl border-8 border-white"
                        />
                    </motion.div>

                    {/* Details */}
                    <div className="flex-grow pt-12 md:pt-32">
                        <div className="flex items-center gap-4 mb-4">
                            {movie.genres.map(g => (
                                <span key={g} className="px-3 py-1 bg-purple-50 text-purple-600 text-xs font-bold rounded-full uppercase tracking-wider border border-purple-100 italic">
                                    {g}
                                </span>
                            ))}
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tighter uppercase leading-[0.9]">
                            {movie.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-8 mb-8 text-gray-500 font-medium">
                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                <span className="text-gray-900 font-bold">{movie.vote_average}</span>
                                <span className="text-xs uppercase tracking-widest text-gray-400">Rating</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                <span>{movie.runtime} min</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                <span>{movie.release_date.split('-')[0]}</span>
                            </div>
                        </div>

                        <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mb-12 italic font-serif">
                             "{movie.overview}"
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <button className="px-8 py-4 bg-purple-600 text-white rounded-2xl font-bold flex items-center gap-3 hover:bg-purple-700 transition-all shadow-xl shadow-purple-200 group">
                                <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                                Watch Trailer
                            </button>
                            <button className="p-4 bg-gray-50 text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transition-all border border-gray-100">
                                <Plus size={24} />
                            </button>
                            <button className="p-4 bg-gray-50 text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transition-all border border-gray-100">
                                <Share2 size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MovieDetail;
