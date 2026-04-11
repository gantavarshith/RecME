import logging
import traceback

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient
from src.config.settings import settings
from api.core.logging_config import setup_logging
from api.routes import recommend, search, mood, chatbot, movies, auth, watchlist, watched, motd, not_interested

from fastapi.middleware.cors import CORSMiddleware

# Initialize structured logging before anything else
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize MongoDB client
    logger.info("Connecting to MongoDB...")
    app.mongodb_client = AsyncIOMotorClient(settings.MONGODB_URL)
    # Be more robust in getting db name
    db_name = settings.MONGODB_URL.split('/')[-1].split('?')[0] or "recme"
    db = app.mongodb_client[db_name]
    app.mongodb = db

    # ENSURE INDEXES FOR SLOW QUERIES
    try:
        # User-centric queries for watchlist, watched, not_interested
        for coll_name in ["watchlist", "watched", "not_interested"]:
            await db[coll_name].create_index([("user_id", 1)])
            await db[coll_name].create_index([("movie_data.id", 1)])

        # User uniqueness
        await db.users.create_index([("email", 1)], unique=True)
        await db.users.create_index([("id", 1)], unique=True)

        logger.info("Critical database indexes ensured successfully.")
    except Exception as e:
        logger.error("Index creation failed: %s", e)

    # PRE-FIT Recommendation Engine to avoid the first-request lag
    try:
        from api.services.movie_service import _build_movie_pool
        from src.recommender.recommend import pre_fit_engine

        logger.info("Pre-building movie pool and fitting recommendation engine...")
        pool = await _build_movie_pool()
        if pool:
            pre_fit_engine(pool)
            logger.info("Recommendation engine fitted and ready with %d movies.", len(pool))
        else:
            logger.warning("Movie pool is empty — engine was NOT pre-fitted.")
    except Exception as e:
        logger.error("Pre-fitting recommendation engine failed: %s", e)

    yield
    # Shutdown: Close MongoDB client
    logger.info("Shutting down MongoDB connection...")
    app.mongodb_client.close()


app = FastAPI(
    title="RecME API",
    description="Movie Recommendation System API",
    version="1.0.0",
    lifespan=lifespan,
)


# ---------------------------------------------------------------------------
# Global Exception Handler — prevents leaking stack traces to clients
# ---------------------------------------------------------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(
        "Unhandled exception on %s %s: %s\n%s",
        request.method,
        request.url.path,
        repr(exc),
        traceback.format_exc(),
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again later."},
    )


# ---------------------------------------------------------------------------
# Health Check Endpoint (for load balancers / uptime monitors)
# ---------------------------------------------------------------------------
@app.get("/health", tags=["Health"])
async def health_check(request: Request):
    """
    Returns the health status of the API and its dependencies.
    Used by load balancers and monitoring systems.
    """
    health = {"status": "healthy", "api": True, "database": False}
    try:
        # Ping MongoDB to verify connection
        await request.app.mongodb.command("ping")
        health["database"] = True
    except Exception as e:
        logger.warning("Health check: MongoDB ping failed: %s", e)
        health["status"] = "degraded"
    return health


# ---------------------------------------------------------------------------
# CORS Configuration
# ---------------------------------------------------------------------------
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
# Add from settings as well
if settings.ALLOWED_ORIGINS:
    for o in settings.ALLOWED_ORIGINS.split(","):
        if o.strip() and o.strip() not in origins:
            origins.append(o.strip())

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
app.include_router(watched.router, prefix="/watched", tags=["Watched"])
app.include_router(motd.router, prefix="/motd", tags=["Movie of the Day"])
app.include_router(not_interested.router, prefix="/not_interested", tags=["Not Interested"])


@app.get("/")
def read_root():
    return {"message": "Welcome to RecME API!"}
