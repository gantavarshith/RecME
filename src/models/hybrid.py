import pandas as pd
import random
from src.models.content_based import ContentBasedRecommender
from src.models.collaborative import CollaborativeRecommender

class HybridRecommender:
    def __init__(self):
        self.content_model = ContentBasedRecommender()
        self.collaborative_model = CollaborativeRecommender()
        self.movies_df = None
        self.ratings_df = None
        self.is_fitted = False

    def recommend(self, user_id, top_k=20):
        """
        Combines content-based and collaborative filtering scores.
        """
        print(f"Generating expert hybrid recommendations for user {user_id}...")
        
        if not self.is_fitted or self.movies_df is None:
            return []

        # 1. Get collaborative filtering suggestions
        cf_recs = self.collaborative_model.get_recommendations(user_id, top_k=top_k*2)
        
        # 2. Get user's past liked movies to feed into Content-Based
        cb_recs = []
        try:
            user_id_int = int(user_id)
            if self.ratings_df is not None:
                user_history = self.ratings_df[self.ratings_df['user_id'] == user_id_int]
                if not user_history.empty:
                    # Find their highest rated movie
                    top_movie_id = user_history.sort_values(by='rating', ascending=False).iloc[0]['movie_id']
                    
                    # Lookup title from ID
                    top_movie_row = self.movies_df.loc[self.movies_df['id'] == top_movie_id]
                    if not top_movie_row.empty:
                        cb_recs = self.content_model.get_recommendations(top_movie_row.iloc[0]['title'], top_k=top_k*2)
        except Exception as e:
            print(f"Error fetching CB recs inside hybrid: {e}")
            pass
            
        # 3. Hybridize (Rank Aggregation)
        hybrid_scores = {}
        
        # Weighted score: CF rank matters more for personalization
        for rank, movie_id in enumerate(cf_recs):
            hybrid_scores[movie_id] = hybrid_scores.get(movie_id, 0) + (len(cf_recs) - rank) * 1.5
            
        for rank, movie_id in enumerate(cb_recs):
            hybrid_scores[movie_id] = hybrid_scores.get(movie_id, 0) + (len(cb_recs) - rank) * 1.0
            
        # If no history/predictions (Cold Start), recommend random popular movies
        if not hybrid_scores:
            popular = self.movies_df['id'].tolist()
            random.shuffle(popular)
            return popular[:top_k]
            
        # Sort and return top_k
        sorted_hybrid = sorted(hybrid_scores.items(), key=lambda x: x[1], reverse=True)
        return [x[0] for x in sorted_hybrid[:top_k]]

    def fit(self, ratings_df, movies_df):
        """
        Trains both internal models.
        """
        self.movies_df = movies_df
        self.ratings_df = ratings_df
        
        print(f"Hybrid Engine Fitting: Dataframes loaded. Movies: {len(movies_df)}.")
        
        print("- Training Content-Based Model...")
        self.content_model.fit(self.movies_df)
        
        print("- Training Collaborative Model...")
        self.collaborative_model.fit(self.ratings_df, self.movies_df)
        
        self.is_fitted = True
        print("Hybrid Engine is fully trained and ready.")
