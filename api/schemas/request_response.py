from pydantic import BaseModel
from typing import List, Optional

class MovieBase(BaseModel):
    id: int
    title: str
    overview: Optional[str]
    poster_path: Optional[str]
    rating: Optional[float]

class MovieResponse(MovieBase):
    genres: List[str]

class RecommendationResponse(BaseModel):
    user_id: Optional[str]
    recommendations: List[MovieBase]
    top_k: int

class SearchResponse(BaseModel):
    query: str
    results: List[MovieBase]

class ChatResponse(BaseModel):
    response: str
