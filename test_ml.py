import sys
import traceback
import asyncio
from src.recommender.recommend import get_ai_recommendations
from api.services.movie_service import _build_movie_pool

async def main():
    try:
        pool = await _build_movie_pool()
        recs = get_ai_recommendations('1', pool, 50)
        print('Recs:', len(recs))
    except Exception as e:
        with open('err.txt', 'w') as f:
            traceback.print_exc(file=f)
        print("Error written to err.txt")

asyncio.run(main())
