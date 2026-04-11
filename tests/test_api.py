"""
Automated test suite for RecME API.
Run with: pytest tests/test_api.py -v
"""
import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


# ---------------------------------------------------------------------------
# Core Health & Root
# ---------------------------------------------------------------------------
class TestCoreEndpoints:
    def test_read_root(self):
        response = client.get("/")
        assert response.status_code == 200
        assert response.json() == {"message": "Welcome to RecME API!"}

    def test_health_check(self):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "api" in data
        assert data["api"] is True


# ---------------------------------------------------------------------------
# Recommendations
# ---------------------------------------------------------------------------
class TestRecommendations:
    def test_recommend_route_returns_list(self):
        response = client.get("/recommend/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_recommend_with_top_k(self):
        response = client.get("/recommend/?top_k=3")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 3

    def test_recommend_top_k_clamped(self):
        """top_k > 50 should be clamped to 50."""
        response = client.get("/recommend/?top_k=999")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 50


# ---------------------------------------------------------------------------
# Search
# ---------------------------------------------------------------------------
class TestSearch:
    def test_search_empty_query(self):
        response = client.get("/search/?query=")
        assert response.status_code == 200
        assert response.json() == []

    def test_search_valid_query(self):
        response = client.get("/search/?query=inception")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


# ---------------------------------------------------------------------------
# Mood
# ---------------------------------------------------------------------------
class TestMood:
    def test_mood_valid(self):
        response = client.get("/mood/?mood=happy")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_mood_top_k_limit(self):
        response = client.get("/mood/?mood=action&top_k=3")
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 3


# ---------------------------------------------------------------------------
# Movies
# ---------------------------------------------------------------------------
class TestMovies:
    def test_tagged_popular(self):
        response = client.get("/movies/tagged/popular")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_tagged_invalid(self):
        response = client.get("/movies/tagged/nonsense")
        assert response.status_code == 200
        assert response.json() == []


# ---------------------------------------------------------------------------
# Auth (no DB required for validation tests)
# ---------------------------------------------------------------------------
class TestAuth:
    def test_me_unauthenticated(self):
        response = client.get("/auth/me")
        assert response.status_code == 401

    def test_login_bad_credentials(self):
        response = client.post(
            "/auth/login",
            data={"username": "fake@email.com", "password": "wrong"},
        )
        # Should be 401 (bad creds) — not 500 (server error)
        assert response.status_code in (401, 422)
