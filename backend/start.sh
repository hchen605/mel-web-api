#!/bin/bash

# Activate the conda environment
conda activate mel-init

# Navigate to the directory containing your FastAPI application
cd /home/hchen/mel-init-web/backend

# Run the FastAPI application
uvicorn main:app --host 0.0.0.0 --port 8000
