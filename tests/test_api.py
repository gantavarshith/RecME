from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to RecME API!"}

def test_recommend_route():
    response = client.get("/recommend/")
    assert response.status_code == 200
    assert "recommendations" in response.json()
