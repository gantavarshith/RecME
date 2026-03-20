import { getRecommendations, searchMovies, getMoodRecommendations } from '../services/api';
import MovieCard from '../components/MovieCard';
import { GooeyTextDemo } from '../components/GooeyTextDemo';
import { useLocation } from 'react-router-dom';
import { Search, Sparkles, SlidersHorizontal } from 'lucide-react';

const Home = () => {
    const [movies, setMovies] = useState([]);
    const [moodMovies, setMoodMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeMood, setActiveMood] = useState(null);
    const location = useLocation();

    const moods = ['Happy', 'Excited', 'Melancholic', 'Adventurous', 'Spooky'];

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const query = searchParams.get('search');

        const fetchData = async () => {
            setIsLoading(true);
            try {
                if (query) {
                    const data = await searchMovies(query);
                    setMovies(data.results || []);
                } else {
                    const data = await getRecommendations('user123');
                    setMovies(data.recommendations || []);
                }
            } catch (error) {
                console.error("Error fetching movies:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [location.search]);

    const handleMoodDiscovery = async (mood) => {
        setActiveMood(mood);
        try {
            const data = await getMoodRecommendations(mood.toLowerCase());
            setMoodMovies(data.recommendations || []);
        } catch (error) {
            console.error("Error fetching mood recommendations:", error);
        }
    };

    return (
        <div className="home-page max-w-7xl mx-auto px-4 pb-20">
            <section className="hero py-20 flex flex-col items-center justify-center min-h-[50vh]">
                <GooeyTextDemo />
                <h2 className="text-2xl md:text-3xl font-medium mt-8 text-gray-500 tracking-tight text-center">
                    {new URLSearchParams(location.search).get('search') 
                        ? `Search results for "${new URLSearchParams(location.search).get('search')}"` 
                        : "Curated cinema. Just for you."}
                </h2>
            </section>
            
            {/* Mood Discovery Section */}
            {!new URLSearchParams(location.search).get('search') && (
                <div className="mb-20">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3 uppercase tracking-tighter">
                            <Sparkles className="w-6 h-6 text-purple-600" />
                            Discover by Mood
                        </h3>
                        <div className="flex gap-2">
                            {moods.map(m => (
                                <button 
                                    key={m}
                                    onClick={() => handleMoodDiscovery(m)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                                        activeMood === m 
                                            ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200' 
                                            : 'bg-white text-gray-500 border-gray-100 hover:border-purple-200 hover:text-purple-600'
                                    }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {activeMood ? (
                        <div className="movie-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {moodMovies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
                            {!moodMovies.length && <p className="col-span-full text-center py-12 text-gray-400 font-medium italic">Finding movies that match your {activeMood.toLowerCase()} vibe...</p>}
                        </div>
                    ) : (
                        <div className="h-20 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl text-gray-400 font-bold text-sm uppercase tracking-widest">
                            Pick a mood to start exploring
                        </div>
                    )}
                </div>
            )}

            <div className="mt-12">
                <h3 className="text-xl font-semibold mb-8 text-left text-gray-900 flex items-center gap-2">
                    <span className="w-8 h-[2px] bg-purple-600"></span>
                    {new URLSearchParams(location.search).get('search') ? "Search Results" : "Recent Recommendations"}
                </h3>
                
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 4, 4].map(i => (
                            <div key={i} className="aspect-[2/3] bg-gray-50 animate-pulse rounded-2xl"></div>
                        ))}
                    </div>
                ) : (
                    <div className="movie-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {movies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
                        {!movies.length && (
                            <div className="col-span-full py-20 text-center">
                                <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-400 font-bold uppercase tracking-widest">No movies found</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};


export default Home;
