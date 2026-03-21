import requests
import json
import uuid

BASE_URL = "http://localhost:8007"

def test_auth_flow():
    email = f"test_{uuid.uuid4().hex[:6]}@example.com"
    password = "password123"
    name = "Test User"

    print(f"--- Starting Auth Verification for {email} ---")

    # 1. Signup
    print("1. Testing Registration...")
    signup_res = requests.post(f"{BASE_URL}/auth/signup", json={
        "name": name,
        "email": email,
        "password": password
    })
    if signup_res.status_code != 200:
        print(f"FAILED: Signup returned {signup_res.status_code}: {signup_res.text}")
        return
    print("SUCCESS: Registered User.")

    # 2. Login
    print("\n2. Testing Login...")
    login_res = requests.post(f"{BASE_URL}/auth/login", data={
        "username": email,
        "password": password
    })
    if login_res.status_code != 200:
        print(f"FAILED: Login returned {login_res.status_code}: {login_res.text}")
        return
    
    auth_data = login_res.json()
    token = auth_data["access_token"]
    user_id = auth_data["user"]["id"]
    print(f"SUCCESS: Logged in. Token starts with: {token[:20]}...")

    # 3. Get Me
    print("\n3. Testing /auth/me...")
    me_res = requests.get(f"{BASE_URL}/auth/me", headers={"Authorization": f"Bearer {token}"})
    if me_res.status_code != 200:
        print(f"FAILED: /auth/me returned {me_res.status_code}")
        return
    print(f"SUCCESS: Current user verified: {me_res.json()['name']}")

    # 4. Watchlist
    print("\n4. Testing Watchlist Add...")
    movie = {
        "id": "12345",
        "title": "Verification Movie",
        "poster_path": "/path.jpg",
        "vote_average": 8.5,
        "release_date": "2024-01-01"
    }
    add_res = requests.post(f"{BASE_URL}/watchlist/add", json=movie, headers={"Authorization": f"Bearer {token}"})
    if add_res.status_code != 200:
        print(f"FAILED: Watchlist add returned {add_res.status_code}")
        return
    print("SUCCESS: Added movie to watchlist.")

    # 5. Get Watchlist
    print("\n5. Testing Watchlist Retrieval...")
    get_res = requests.get(f"{BASE_URL}/watchlist/", headers={"Authorization": f"Bearer {token}"})
    watchlist = get_res.json()
    if not any(m['title'] == 'Verification Movie' for m in watchlist):
        print("FAILED: Movie not found in watchlist.")
        return
    print(f"SUCCESS: Watchlist retrieved. Items count: {len(watchlist)}")

    print("\n--- ALL TESTS PASSED ---")

if __name__ == "__main__":
    test_auth_flow()
