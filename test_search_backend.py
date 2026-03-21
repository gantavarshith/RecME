import asyncio
import os
import sys

# Add current dir to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from api.services.movie_service import search_films, get_top_movies

async def main():
    try:
        with open("output.txt", "w") as f:
            f.write("Fetching top movies...\n")
            res = await get_top_movies()
            f.write(f"Top movies found: {len(res)}\n")
            
            f.write("Searching for inception...\n")
            res2 = await search_films("inception")
            f.write(f"Search results found: {len(res2)}\n")
            
    except Exception as e:
        import traceback
        with open("output.txt", "a") as f:
            f.write("Fatal Error:\n")
            traceback.print_exc(file=f)

asyncio.run(main())
