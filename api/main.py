from fastapi import FastAPI
from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient
from src.config.settings import settings
from api.routes import recommend, search, mood, chatbot, movies, auth, watchlist
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize MongoDB client
    app.mongodb_client = AsyncIOMotorClient(settings.MONGODB_URL)
    app.mongodb = app.mongodb_client[settings.MONGODB_URL.split('/')[-1]]
    yield
    # Shutdown: Close MongoDB client
    app.mongodb_client.close()

app = FastAPI(
    title="RecME API", 
    description="Movie Recommendation System API",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://0.0.0.0:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Set-Cookie"],
)

# Include Routers
app.include_router(recommend.router, prefix="/recommend", tags=["Recommendations"])
app.include_router(search.router, prefix="/search", tags=["Search"])
app.include_router(mood.router, prefix="/mood", tags=["Mood"])
app.include_router(chatbot.router, prefix="/chatbot", tags=["AI Chatbot"])
app.include_router(movies.router, prefix="/movies", tags=["Movies"])
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(watchlist.router, prefix="/watchlist", tags=["Watchlist"])

@app.get("/")
def read_root():
    return {"message": "Welcome to RecME API!"}
