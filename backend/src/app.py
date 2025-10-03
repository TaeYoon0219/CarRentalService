# FastAPI equivalent of the Express.js server
# Provides the same functionality as app.js but using Python and FastAPI

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles  # ADD THIS LINE
from pydantic import BaseModel
import sqlite3
import os
from pathlib import Path
from typing import List, Dict, Any

# Create FastAPI app instance
app = FastAPI(title="Car Rental Service API", version="1.0.0")

# Add CORS middleware to handle cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ADD THIS LINE - Serve static files (images) from uploads directory
app.mount("/uploads", StaticFiles(directory=str(Path(__file__).parent.parent / "uploads")), name="uploads")

# Database path - same location as the Node.js version
DB_PATH = Path(__file__).parent.parent / "db" / "carrental.db"

def get_db_connection():
    """Get a database connection"""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row  # This allows accessing columns by name
    return conn

def ensure_database_exists():
    """Ensure the database exists and has proper schema"""
    if not DB_PATH.exists():
        # If database doesn't exist, create it by running the schema
        schema_path = DB_PATH.parent / "database.sql"
        if schema_path.exists():
            conn = sqlite3.connect(str(DB_PATH))
            with open(schema_path, 'r') as f:
                conn.executescript(f.read())
            conn.close()
            print("[DB] Schema loaded from database.sql")

# Initialize database on startup
ensure_database_exists()

# Pydantic models for request/response validation
class UserCreate(BaseModel):
    full_name: str
    email: str
    password_hash: str

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str

class ReservationCreate(BaseModel):
    user_id: int
    car_id: int
    start_datetime: str
    end_datetime: str

class ReservationResponse(BaseModel):
    id: int

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Car Rental Service API is running"}

# GET /api/cars - Retrieve all cars from the database
@app.get("/api/cars")
async def get_cars() -> List[Dict[str, Any]]:
    """Get all cars from the cars table"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM cars")
        cars = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return cars
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# POST /api/users - Insert data into users table
@app.post("/api/users", response_model=UserResponse)
async def create_user(user: UserCreate):
    """Create a new user in the users table"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)",
            (user.full_name, user.email, user.password_hash)
        )
        
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return UserResponse(
            id=user_id,
            full_name=user.full_name,
            email=user.email
        )
        
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=f"User creation failed: {str(e)}")
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# POST /api/reservations - Insert reservation into reservations table
@app.post("/api/reservations", response_model=ReservationResponse)
async def create_reservation(reservation: ReservationCreate):
    """Create a new reservation in the reservations table"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Insert reservation with daily_rate_cents from cars table and status 'confirmed'
        cursor.execute("""
            INSERT INTO reservations (user_id, car_id, start_datetime, end_datetime, daily_rate_cents, status)
            VALUES (?, ?, ?, ?, (SELECT daily_rate_cents FROM cars WHERE id = ?), 'confirmed')
        """, (
            reservation.user_id,
            reservation.car_id,
            reservation.start_datetime,
            reservation.end_datetime,
            reservation.car_id
        ))
        
        reservation_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return ReservationResponse(id=reservation_id)
        
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "car-rental-api"}

if __name__ == "__main__":
    import uvicorn
    # Start the server on port 3001 to match the original Express server
    uvicorn.run(app, host="0.0.0.0", port=3001)