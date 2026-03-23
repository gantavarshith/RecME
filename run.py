import argparse
import subprocess
import sys
import os

def get_venv_bin(name):
    if os.name == "nt":  # Windows
        return os.path.join(".venv", "Scripts", f"{name}.exe")
    return os.path.join(".venv", "bin", name)

def run_api():
    print("Starting FastAPI backend on port 8007...")
    uvicorn_path = get_venv_bin("uvicorn")
    if os.path.exists(uvicorn_path):
        subprocess.run([uvicorn_path, "api.main:app", "--reload", "--host", "0.0.0.0", "--port", "8007"], shell=True)
    else:
        subprocess.run(["uvicorn", "api.main:app", "--reload", "--host", "0.0.0.0", "--port", "8007"], shell=True)

def run_frontend():
    print("Starting React frontend...")
    os.chdir("frontend")
    subprocess.run(["npm", "run", "dev"], shell=True)

def run_pipeline():
    print("Running training pipeline...")
    python_path = get_venv_bin("python")
    if os.path.exists(python_path):
        subprocess.run([python_path, "pipeline/training_pipeline.py"], shell=True)
    else:
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
