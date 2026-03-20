# RecME - Movie Recommendation Engine

RecME is a full-stack movie recommendation system that combines content-based and collaborative filtering.

## Project Structure

```
RecME/
├── data/           # Raw, processed, and external datasets
├── notebooks/      # Jupyter notebooks for EDA and modeling
├── src/            # Core logic (models, integrations, agency)
├── api/            # FastAPI backend
├── frontend/       # React frontend
├── pipeline/       # Training and inference pipelines
└── deployment/     # Docker and cloud deployment configs
```

## Setup

1.  **Backend**:
    ```bash
    pip install -r requirements.txt
    python run.py --api
    ```

2.  **Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## AI Features

- **Mood-based recommendations**: Get movies based on your current vibe.
- **AI Chatbot**: Talk to an agent to find your next favorite movie.
