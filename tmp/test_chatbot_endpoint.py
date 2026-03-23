import requests
import json

def test_chatbot():
    url = "http://localhost:8007/chatbot/chat"
    payload = {
        "message": "Recommend a thriller",
        "history": []
    }
    try:
        response = requests.post(url, json=payload, timeout=30)
        print(f"Status: {response.status_code}")
        print(f"Body: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_chatbot()
