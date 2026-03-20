import pandas as pd
from src.data.load_data import load_raw_data
from src.data.preprocess import preprocess_movies, preprocess_ratings
from src.models.hybrid import HybridRecommender
import pickle
import os

def run_training_pipeline():
    print("Starting training pipeline...")
    
    # 1. Load data
    # movies, ratings = load_raw_data()
    
    # 2. Preprocess
    # movies_clean = preprocess_movies(movies)
    # ratings_clean = preprocess_ratings(ratings)
    
    # 3. Train Model
    recommender = HybridRecommender()
    # recommender.fit(ratings_clean, movies_clean)
    
    # 4. Save Model
    os.makedirs("models", exist_ok=True)
    with open("models/hybrid_model.pkl", "wb") as f:
        pickle.dump(recommender, f)
        
    print("Training complete. Model saved to models/hybrid_model.pkl")

if __name__ == "__main__":
    run_training_pipeline()
