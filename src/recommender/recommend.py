import logging

import pandas as pd
import random
from src.models.hybrid import HybridRecommender

logger = logging.getLogger(__name__)

# Global Singleton instance for the recommendation engine
hybrid_engine = HybridRecommender()

def get_ai_recommendations(user_id, movies_pool: list[dict], top_k=20):
    """
    Main entry point for AI logic. Lazy-trains the model upon first request
    using the live TMDB pool and synthetic history.
    """
    if not hybrid_engine.is_fitted:
        pre_fit_engine(movies_pool, user_id)

    return hybrid_engine.recommend(user_id, top_k=top_k)

def pre_fit_engine(movies_pool: list[dict], target_user_id: str = "1"):
    """
    Manual entry point to fit the engine (used during startup).
    """
    if hybrid_engine.is_fitted:
        return

    logger.info("Initializing AI engine with %d movies...", len(movies_pool))
    movies_df = pd.DataFrame(movies_pool)

    # Build synthetic ratings df
    synthetic_ratings = []
    user_ids = [str(i) for i in range(1, 100)] # dummy users
    movie_ids = movies_df['id'].tolist()

    for u in user_ids:
        num_ratings = random.randint(5, 15)
        rated_movies = random.sample(movie_ids, min(num_ratings, len(movie_ids)))
        for m in rated_movies:
            synthetic_ratings.append({'user_id': int(u), 'movie_id': m, 'rating': round(random.uniform(2.5, 5.0), 1)})

    # Ensure our target user has some data too
    target_uid = int(target_user_id) if isinstance(target_user_id, str) and target_user_id.isdigit() else 1
    num_ratings = random.randint(5, 10)
    rated_movies = random.sample(movie_ids, min(num_ratings, len(movie_ids)))
    for m in rated_movies:
        synthetic_ratings.append({'user_id': target_uid, 'movie_id': m, 'rating': round(random.uniform(4.0, 5.0), 1)})

    ratings_df = pd.DataFrame(synthetic_ratings)
    hybrid_engine.fit(ratings_df, movies_df)
    logger.info("AI engine fitting complete.")
