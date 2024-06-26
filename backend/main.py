from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import subprocess

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)
# Directories
UPLOAD_DIR = './uploads'
GENERATED_DIR = './generated'

# Ensure the directories exist
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)
if not os.path.exists(GENERATED_DIR):
    os.makedirs(GENERATED_DIR)

@app.post("/generate")
async def generate(
    file: UploadFile = File(...),
    segment: str = Form(...),
    rhythm: int = Form(...),
    polyphony: int = Form(...),
    tempo: int = Form(...)
):
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    
    # Save the uploaded file
    with open(file_location, "wb+") as file_object:
        file_object.write(file.file.read())

    # Define paths for generated files
    arrangement_piano_path = os.path.join(GENERATED_DIR, "arrangement_piano_1.mid")
    arrangement_band_path = os.path.join(GENERATED_DIR, "arrangement_band_1.mid")

    # Set the PYTHONPATH to include the directory of your scripts
    env = os.environ.copy()
    #env['PYTHONPATH'] = "../../ai_melception/init:" + env.get('PYTHONPATH', '')
    env['PYTHONPATH'] = "../../ai_melception/init:../../ai_melception/init/piano_arranger:../../ai_melception/init/piano_arranger/chord_recognition:" + env.get('PYTHONPATH', '')


    # Command to execute the script with the provided parameters
    command = [
        "python",
        "../../ai_melception/init/gen_sample_preload.py",
        "--midi_path", file_location,
        "--segment", segment,
        "--rhythm", str(rhythm),
        "--polyphony", str(polyphony),
        "--tempo", str(tempo),
        "--output_piano", arrangement_piano_path,
        "--output_band", arrangement_band_path
    ]

    # Execute the command and capture the output
    try:
        print("Running command:", " ".join(command))
        result = subprocess.run(command, check=True, capture_output=True, text=True)
        print("Command output:", result.stdout)
        print("Command error (if any):", result.stderr)
        return {
            "status": "success",
            "message": result.stdout,
            "piano_path": arrangement_piano_path,
            "band_path": arrangement_band_path
        }
    except subprocess.CalledProcessError as e:
        print("Error executing command:", e.stderr)
        return {"status": "error", "message": e.stderr}

@app.get("/download/{filename}")
async def download_file(filename: str):
    file_path = os.path.join(GENERATED_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(path=file_path, filename=filename, media_type='application/octet-stream')
    return {"error": "File not found"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
