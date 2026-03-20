import argparse
import subprocess
import sys
import os

def run_api():
    print("Starting FastAPI backend...")
    subprocess.run(["uvicorn", "api.main:app", "--reload"], shell=True)

def run_frontend():
    print("Starting React frontend...")
    os.chdir("frontend")
    subprocess.run(["npm", "run", "dev"], shell=True)

def run_pipeline():
    print("Running training pipeline...")
    subprocess.run(["python", "pipeline/training_pipeline.py"], shell=True)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="RecME Runner")
    parser.add_argument("--api", action="store_true", help="Run the backend API")
    parser.add_argument("--frontend", action="store_true", help="Run the frontend")
    parser.add_argument("--pipeline", action="store_true", help="Run the training pipeline")

    args = parser.parse_args()

    if args.api:
        run_api()
    elif args.frontend:
        run_frontend()
    elif args.pipeline:
        run_pipeline()
    else:
        parser.print_help()
