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

class ReservationUpdate(BaseModel):
    start_datetime: str
    end_datetime: str

class UserLogin(BaseModel):
    email: str
    password_hash: str

class PaymentCreate(BaseModel):
    reservation_id: int
    amount_cents: int
    card_number: str
    card_holder: str
    expiry_date: str
    cvv: str

class PaymentResponse(BaseModel):
    id: int
    reservation_id: int
    status: str

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

# GET /api/cars/{car_id}/bookings - Get all bookings for a specific car
@app.get("/api/cars/{car_id}/bookings")
async def get_car_bookings(car_id: int):
    """Get all confirmed and pending reservations for a specific car"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, start_datetime, end_datetime, status
            FROM reservations
            WHERE car_id = ?
            AND status IN ('confirmed', 'pending')
            ORDER BY start_datetime
        """, (car_id,))
        bookings = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return bookings
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# POST /api/login - Login user by email and password
@app.post("/api/login", response_model=UserResponse)
async def login_user(credentials: UserLogin):
    """Login user by checking email and password"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT id, full_name, email, password_hash FROM users WHERE email = ?",
            (credentials.email,)
        )
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Simple password check (in production, use proper password hashing)
        if user['password_hash'] != credentials.password_hash:
            raise HTTPException(status_code=401, detail="Invalid password")
        
        return UserResponse(
            id=user['id'],
            full_name=user['full_name'],
            email=user['email']
        )
        
    except HTTPException:
        raise
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# POST /api/users - Insert data into users table
@app.post("/api/users", response_model=UserResponse)
async def create_user(user: UserCreate):
    """Create a new user in the users table"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE email = ?", (user.email,))
        existing = cursor.fetchone()
        if existing:
            conn.close()
            raise HTTPException(status_code=400, detail="User with this email already exists")
        
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
        
        # Check if car is available for the requested dates
        cursor.execute("""
            SELECT COUNT(*) as conflict_count
            FROM reservations
            WHERE car_id = ?
            AND status IN ('confirmed', 'pending')
            AND (
                (start_datetime <= ? AND end_datetime > ?)
                OR (start_datetime < ? AND end_datetime >= ?)
                OR (start_datetime >= ? AND end_datetime <= ?)
            )
        """, (
            reservation.car_id,
            reservation.start_datetime, reservation.start_datetime,
            reservation.end_datetime, reservation.end_datetime,
            reservation.start_datetime, reservation.end_datetime
        ))
        
        result = cursor.fetchone()
        if result['conflict_count'] > 0:
            conn.close()
            raise HTTPException(
                status_code=409, 
                detail="This car is already reserved for the selected dates. Please choose different dates or another vehicle."
            )
        
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

# POST /api/payments - Process payment for a reservation
@app.post("/api/payments", response_model=PaymentResponse)
async def create_payment(payment: PaymentCreate):
    """Process payment for a reservation"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if reservation exists
        cursor.execute("SELECT id, status FROM reservations WHERE id = ?", (payment.reservation_id,))
        reservation = cursor.fetchone()
        
        if not reservation:
            conn.close()
            raise HTTPException(status_code=404, detail="Reservation not found")
        
        # No validation - accept any dummy card numbers
        # In production, you would validate with a payment processor (Stripe, PayPal, etc.)
        
        # Store card info as-is (for demo purposes)
        masked_card = payment.card_number
        
        cursor.execute("""
            INSERT INTO payments (reservation_id, amount_cents, currency, provider, provider_ref, status)
            VALUES (?, ?, 'USD', 'test', ?, 'paid')
        """, (
            payment.reservation_id,
            payment.amount_cents,
            masked_card
        ))
        
        payment_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return PaymentResponse(
            id=payment_id,
            reservation_id=payment.reservation_id,
            status='paid'
        )
        
    except HTTPException:
        raise
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# GET /api/reservations/user/{user_id} - Get all reservations for a specific user
@app.get("/api/reservations/user/{user_id}")
async def get_user_reservations(user_id: int) -> List[Dict[str, Any]]:
    """Get all reservations for a specific user with car details"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                r.id,
                r.user_id,
                r.car_id,
                r.start_datetime,
                r.end_datetime,
                r.status,
                r.daily_rate_cents,
                r.created_at,
                c.make,
                c.model,
                c.year,
                c.color,
                c.transmission,
                c.image_url
            FROM reservations r
            JOIN cars c ON r.car_id = c.id
            WHERE r.user_id = ?
            ORDER BY r.start_datetime DESC
        """, (user_id,))
        reservations = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return reservations
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# PUT /api/reservations/{reservation_id} - Update a reservation
@app.put("/api/reservations/{reservation_id}")
async def update_reservation(reservation_id: int, reservation: ReservationUpdate):
    """Update a reservation's dates"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if reservation exists and is not cancelled or completed
        cursor.execute("SELECT status, car_id FROM reservations WHERE id = ?", (reservation_id,))
        result = cursor.fetchone()
        
        if not result:
            conn.close()
            raise HTTPException(status_code=404, detail="Reservation not found")
        
        if result['status'] in ['cancelled', 'completed']:
            conn.close()
            raise HTTPException(status_code=400, detail=f"Cannot update {result['status']} reservation")
        
        # Check if car is available for the new dates (excluding current reservation)
        cursor.execute("""
            SELECT COUNT(*) as conflict_count
            FROM reservations
            WHERE car_id = ?
            AND id != ?
            AND status IN ('confirmed', 'pending')
            AND (
                (start_datetime <= ? AND end_datetime > ?)
                OR (start_datetime < ? AND end_datetime >= ?)
                OR (start_datetime >= ? AND end_datetime <= ?)
            )
        """, (
            result['car_id'],
            reservation_id,
            reservation.start_datetime, reservation.start_datetime,
            reservation.end_datetime, reservation.end_datetime,
            reservation.start_datetime, reservation.end_datetime
        ))
        
        conflict_result = cursor.fetchone()
        if conflict_result['conflict_count'] > 0:
            conn.close()
            raise HTTPException(
                status_code=409, 
                detail="This car is already reserved for the selected dates. Please choose different dates."
            )
        
        # Update the reservation
        cursor.execute("""
            UPDATE reservations 
            SET start_datetime = ?, end_datetime = ?
            WHERE id = ?
        """, (reservation.start_datetime, reservation.end_datetime, reservation_id))
        
        conn.commit()
        conn.close()
        
        return {"message": "Reservation updated successfully", "id": reservation_id}
        
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# DELETE /api/reservations/{reservation_id} - Cancel a reservation
@app.delete("/api/reservations/{reservation_id}")
async def cancel_reservation(reservation_id: int):
    """Cancel a reservation (set status to cancelled)"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if reservation exists
        cursor.execute("SELECT status FROM reservations WHERE id = ?", (reservation_id,))
        result = cursor.fetchone()
        
        if not result:
            conn.close()
            raise HTTPException(status_code=404, detail="Reservation not found")
        
        if result['status'] == 'cancelled':
            conn.close()
            raise HTTPException(status_code=400, detail="Reservation is already cancelled")
        
        if result['status'] == 'completed':
            conn.close()
            raise HTTPException(status_code=400, detail="Cannot cancel completed reservation")
        
        # Update status to cancelled
        cursor.execute("""
            UPDATE reservations 
            SET status = 'cancelled'
            WHERE id = ?
        """, (reservation_id,))
        
        conn.commit()
        conn.close()
        
        return {"message": "Reservation cancelled successfully", "id": reservation_id}
        
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