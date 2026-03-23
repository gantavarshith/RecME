import pandas as pd

def preprocess_movies(movies_df):
    """
    Cleans movie data for TMDB 5000.
    """
    # 1. Fill missing overviews
    movies_df['overview'] = movies_df['overview'].fillna('')
    
    # 2. Ensure titles are treated as strings
    movies_df['title'] = movies_df['title'].astype(str)
    
    # 3. Ensure IDs are integers
    if 'id' in movies_df.columns:
        movies_df['id'] = pd.to_numeric(movies_df['id'], errors='coerce').fillna(0).astype(int)
        
    return movies_df

def preprocess_ratings(ratings_df):
    """
    Cleans user-movie ratings data.
    """
    # 1. Drop exact duplicates
    ratings_df = ratings_df.drop_duplicates()
    
    # 2. Handle multiple ratings for the same user-movie pair (keep latest or average)
    ratings_df = ratings_df.groupby(['user_id', 'movie_id']).rating.mean().reset_index()
    
    # 3. Ensure numeric types
    ratings_df['user_id'] = pd.to_numeric(ratings_df['user_id'], errors='coerce')
    ratings_df['movie_id'] = pd.to_numeric(ratings_df['movie_id'], errors='coerce')
    ratings_df['rating'] = pd.to_numeric(ratings_df['rating'], errors='coerce')
    
    return ratings_df.dropna()
