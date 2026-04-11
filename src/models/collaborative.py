import logging

import pandas as pd
import numpy as np
from scipy.sparse.linalg import svds

logger = logging.getLogger(__name__)


class CollaborativeRecommender:
    def __init__(self):
        self.preds_df = None
        self.movies_list = None

    def fit(self, ratings_df, movies_df):
        """
        Trains an SVD collaborative filtering model using ratings.
        """
        if ratings_df is None or ratings_df.empty:
            logger.warning("No ratings provided for collaborative filtering.")
            return

        # Create a pivot table for users x movies (drop duplicates if any)
        R_df = ratings_df.drop_duplicates(subset=['user_id', 'movie_id']).pivot(index='user_id', columns='movie_id', values='rating').fillna(0)

        if R_df.empty or R_df.shape[0] < 2 or R_df.shape[1] < 2:
            logger.warning("Insufficient data for collaborative filtering (matrix size: %s).", R_df.shape)
            return

        R = R_df.to_numpy()
        user_ratings_mean = np.mean(R, axis=1)
        R_demeaned = R - user_ratings_mean.reshape(-1, 1)

        # Extract k strictly less than min(R.shape)
        k = min(20, min(R.shape) - 1)
        if k < 1:
            logger.warning("Matrix too small for SVD decomposition.")
            return

        # Perform SVD
        logger.info("Computing SVD with k=%d dimensions on %s matrix...", k, R_df.shape)
        U, sigma, Vt = svds(R_demeaned, k=k)
        sigma = np.diag(sigma)

        # Reconstruct predictions
        all_user_predicted_ratings = np.dot(np.dot(U, sigma), Vt) + user_ratings_mean.reshape(-1, 1)
        self.preds_df = pd.DataFrame(all_user_predicted_ratings, columns=R_df.columns, index=R_df.index)
        self.movies_list = movies_df['id'].tolist() if movies_df is not None else R_df.columns.tolist()

    def get_recommendations(self, user_id, top_k=10):
        if self.preds_df is None:
            return []

        try:
            # Convert user_id to int if necessary
            user_id = int(user_id)
            if user_id not in self.preds_df.index:
                # Cold start: user doesn't exist
                return []

            sorted_user_predictions = self.preds_df.loc[user_id].sort_values(ascending=False)

            # Returns top K predicted movie IDs
            return sorted_user_predictions.head(top_k).index.tolist()
        except (ValueError, TypeError):
            # user_id cannot be converted to int (e.g. UUID strings from auth)
            logger.debug("User ID '%s' is not an integer, skipping collaborative filtering.", user_id)
            return []
        except Exception as e:
            logger.error("Collaborative filtering exception: %s", repr(e))
            return []
