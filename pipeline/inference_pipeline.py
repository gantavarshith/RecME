import pickle

def run_inference(user_id, top_k=10):
    with open("models/hybrid_model.pkl", "rb") as f:
        model = pickle.load(f)
    return model.recommend(user_id, top_k)

if __name__ == "__main__":
    # Example inference
    # results = run_inference("user123")
    # print(results)
    pass
