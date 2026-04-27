from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import random
import uuid
from datetime import datetime

app = FastAPI(title="WorkGuardAI API")

# Allow frontend to talk to this backend later
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Mock Grid State (5x5 grid, stored in memory for now) ---
GRID_SIZE = 5
PLANNED_DEPTH = 43.0  # meters, as per RFP

grid_state = {}
for row in range(GRID_SIZE):
    for col in range(GRID_SIZE):
        cell_id = f"{row}-{col}"
        grid_state[cell_id] = {
            "cell_id": cell_id,
            "row": row,
            "col": col,
            "status": "not_started",   # not_started | in_progress | completed
            "current_depth": 0.0,
            "planned_depth": PLANNED_DEPTH,
            "progress_percent": 0.0,
            "last_updated": None
        }


# --- Mock Model Function (swap this out when real model arrives) ---
def run_mock_model(filename: str):
    """
    This is your placeholder for the real ML model.
    Right now it returns random realistic-looking data.
    When teammates give you the model file, you only change THIS function.
    """
    current_depth = round(random.uniform(0, PLANNED_DEPTH), 2)
    progress = round((current_depth / PLANNED_DEPTH) * 100, 1)

    if progress == 0:
        status = "not_started"
    elif progress >= 100:
        status = "completed"
    else:
        status = "in_progress"

    return {
        "current_depth": current_depth,
        "progress_percent": progress,
        "status": status
    }


# --- Routes ---

@app.get("/")
def root():
    return {"message": "WorkGuardAI backend is running"}


@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    """
    Accepts an image from a drone or camera.
    Runs it through the model (mock for now).
    Updates a random grid cell with the result.
    """
    # Run mock model on the uploaded image
    result = run_mock_model(file.filename)

    # Pick a random grid cell to update (will be zone-based when real model is ready)
    row = random.randint(0, GRID_SIZE - 1)
    col = random.randint(0, GRID_SIZE - 1)
    cell_id = f"{row}-{col}"

    # Update grid state
    grid_state[cell_id].update({
        "status": result["status"],
        "current_depth": result["current_depth"],
        "progress_percent": result["progress_percent"],
        "last_updated": datetime.now().isoformat()
    })

    return {
        "success": True,
        "cell_updated": cell_id,
        "analysis": result
    }


@app.get("/grid")
def get_grid():
    """
    Returns the full grid state for the dashboard to render.
    """
    cells = list(grid_state.values())
    total = len(cells)
    completed = sum(1 for c in cells if c["status"] == "completed")
    in_progress = sum(1 for c in cells if c["status"] == "in_progress")
    not_started = sum(1 for c in cells if c["status"] == "not_started")
    avg_depth = round(sum(c["current_depth"] for c in cells) / total, 2)

    return {
        "grid": cells,
        "summary": {
            "total_cells": total,
            "completed": completed,
            "in_progress": in_progress,
            "not_started": not_started,
            "average_depth": avg_depth,
            "planned_depth": PLANNED_DEPTH
        }
    }