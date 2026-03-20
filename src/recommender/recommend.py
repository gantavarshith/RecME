from src.models.hybrid import HybridRecommender

class RecommenderInterface:
    def __init__(self):
        self.recommender = HybridRecommender()

    def get_recommendations(self, user_id, top_k=10):
        # Add pre/post processing here
        return self.recommender.recommend(user_id, top_k)
