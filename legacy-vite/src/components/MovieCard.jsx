import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
    // For demo purposes, we use title as ID if real id is not available or non-numeric
    const movieId = movie.id || movie.title.toLowerCase().replace(/ /g, '-');
    
    return (
        <Link to={`/movie/${movieId}`} className="block">
            <div className="movie-card bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-gray-200">
                <img src={movie.poster_path} alt={movie.title} className="w-full h-auto aspect-[2/3] object-cover" />
                <div className="p-4 text-left">
                    <h3 className="text-xl font-bold mb-2 text-gray-900 line-clamp-1">{movie.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{movie.overview}</p>
                </div>
            </div>
        </Link>
    );
};

export default MovieCard;
