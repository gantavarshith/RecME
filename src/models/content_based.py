import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
import ast
import os

class ContentBasedRecommender:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.tfidf_matrix = None
        self.movies_df = None
        self.cosine_sim = None
        self.indices = None

    def fit(self, movies_df, credits_csv_path=r"C:\Users\reddy\Downloads\tmdb_5000_credits.csv"):
        """
        Fits the TF-IDF vectorizer on movie overviews and credits metadata.
        movies_df is expected to have 'id', 'title', 'overview'.
        """
        self.movies_df = movies_df.copy()
        
        # Ensure ID columns match for merge
        if 'id' in self.movies_df.columns:
            self.movies_df['id'] = self.movies_df['id'].astype(int)
        
        if os.path.exists(credits_csv_path) and 'id' in self.movies_df.columns:
            print(f"Loading credits metadata from {credits_csv_path}...")
            credits_df = pd.read_csv(credits_csv_path)
            credits_df = credits_df.rename(columns={'movie_id': 'id'})
            
            # Merge on id
            self.movies_df = self.movies_df.merge(credits_df[['id', 'cast', 'crew']], on='id', how='left')
            
            # Parse features safely
            features = ['cast', 'crew']
            for feature in features:
                self.movies_df[feature] = self.movies_df[feature].apply(
                    lambda x: ast.literal_eval(x) if pd.notnull(x) and isinstance(x, str) else []
                )
            
            def get_director(x):
                for i in x:
                    if i.get('job') == 'Director':
                        return i.get('name')
                return ''
                
            def get_top3(x):
                if isinstance(x, list):
                    names = [i.get('name') for i in x if 'name' in i]
                    return names[:3]
                return []
                
            def clean_data(x):
                if isinstance(x, list):
                    return [str.lower(i.replace(" ", "")) for i in x]
                elif isinstance(x, str):
                    return str.lower(x.replace(" ", ""))
                else:
                    return ''

            self.movies_df['director'] = self.movies_df['crew'].apply(get_director)
            self.movies_df['cast'] = self.movies_df['cast'].apply(get_top3)
            
            for feature in ['cast', 'director']:
                self.movies_df[feature] = self.movies_df[feature].apply(clean_data)
                
            def create_soup(x):
                cast_str = ' '.join(x['cast']) if isinstance(x['cast'], list) else ''
                director_str = x['director'] if isinstance(x['director'], str) else ''
                overview_str = str(x['overview']) if pd.notnull(x['overview']) else ''
                return f"{cast_str} {director_str} {overview_str}"
                
            self.movies_df['soup'] = self.movies_df.apply(create_soup, axis=1)
        else:
            print("Credits CSV not found or missing IDs, relying solely on overview data.")
            self.movies_df['soup'] = self.movies_df['overview'].fillna('')

        print("Computing TF-IDF matrix...")
        # Compute TF-IDF
        self.tfidf_matrix = self.vectorizer.fit_transform(self.movies_df['soup'].fillna(''))
        
        # Compute Cosine Similarity
        self.cosine_sim = linear_kernel(self.tfidf_matrix, self.tfidf_matrix)

        # Create indices map to reverse lookup title to index
        if 'title' in self.movies_df.columns:
            self.movies_df['lower_title'] = self.movies_df['title'].astype(str).str.lower()
            self.indices = pd.Series(self.movies_df.index, index=self.movies_df['lower_title']).drop_duplicates()

    def get_recommendations(self, title, top_k=10):
        if self.cosine_sim is None or self.indices is None:
            return []
            
        title_lower = title.lower()
        if title_lower not in self.indices:
            print(f"Title '{title}' not found in content model indices.")
            return []
            
        # Get index
        idx = self.indices[title_lower]
        if isinstance(idx, pd.Series):
            idx = idx.iloc[0]
            
        sim_scores = list(enumerate(self.cosine_sim[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        # Get the scores of the most similar movies (ignoring the movie itself at index 0)
        sim_scores = sim_scores[1:top_k+1]
        
        movie_indices = [i[0] for i in sim_scores]
        
        return self.movies_df['id'].iloc[movie_indices].tolist()
