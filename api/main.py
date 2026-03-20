from fastapi import FastAPI
from api.routes import recommend, search, mood, chatbot, movies
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="RecME API", description="Movie Recommendation System API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(recommend.router, prefix="/recommend", tags=["Recommendations"])
app.include_router(search.router, prefix="/search", tags=["Search"])
app.include_router(mood.router, prefix="/mood", tags=["Mood"])
app.include_router(chatbot.router, prefix="/chatbot", tags=["AI Chatbot"])
app.include_router(movies.router, prefix="/movies", tags=["Movies"])

@app.get("/")
def read_root():
    return {"message": "Welcome to RecME API!"}
