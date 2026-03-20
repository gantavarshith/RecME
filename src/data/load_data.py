import pandas as pd

def load_raw_data(data_dir="data/raw"):
    movies = pd.read_csv(f"{data_dir}/movies.csv")
    ratings = pd.read_csv(f"{data_dir}/ratings.csv")
    return movies, ratings

def load_processed_data(data_dir="data/processed"):
    movies_clean = pd.read_csv(f"{data_dir}/movies_clean.csv")
    return movies_clean
