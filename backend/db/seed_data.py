#!/usr/bin/env python3
"""
Database seeding script for Car Rental Service
Populates the database with dummy data for testing purposes
"""

import sqlite3
import random
from datetime import datetime, timedelta
from pathlib import Path

# Database path
DB_PATH = Path(__file__).parent / "carrental.db"

def seed_database():
    """Populate the database with dummy data"""
    
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    print("🌱 Starting database seeding...")
    
    # Clear existing data (optional - uncomment if you want fresh data)
    # cursor.execute("DELETE FROM payments")
    # cursor.execute("DELETE FROM reservations")
    # cursor.execute("DELETE FROM car_features")
    # cursor.execute("DELETE FROM features")
    # cursor.execute("DELETE FROM cars")
    # cursor.execute("DELETE FROM users")
    
    # Seed Features first
    features_data = [
        ('bluetooth', 'Bluetooth Connectivity'),
        ('awd', 'All-Wheel Drive'),
        ('sunroof', 'Sunroof'),
        ('gps', 'GPS Navigation'),
        ('heated_seats', 'Heated Seats'),
        ('backup_camera', 'Backup Camera'),
        ('cruise_control', 'Cruise Control'),
        ('leather_seats', 'Leather Seats'),
        ('wireless_charging', 'Wireless Phone Charging'),
        ('premium_audio', 'Premium Audio System')
    ]
    
    cursor.executemany(
        "INSERT OR IGNORE INTO features (key, name) VALUES (?, ?)",
        features_data
    )
    print("✅ Added 10 car features")
    
    # Seed Cars - 10 diverse vehicles
    cars_data = [
        ('1HGBH41JXMN109186', 'Toyota', 'Camry', 2023, 'Automatic', 5, 4, 'White', 4500, 'available'),
        ('JHMCM82633C004352', 'Honda', 'Civic', 2022, 'Manual', 5, 4, 'Blue', 3800, 'available'),
        ('1C3CCBCB6DN121234', 'BMW', 'X5', 2023, 'Automatic', 7, 4, 'Black', 8900, 'available'),
        ('WAUAFAFL5CN009234', 'Audi', 'A4', 2022, 'Automatic', 5, 4, 'Silver', 6200, 'available'),
        ('1FTFW1ET5DFC10312', 'Ford', 'F-150', 2023, 'Automatic', 6, 4, 'Red', 7500, 'available'),
        ('JM1BK32F281780234', 'Mazda', 'CX-5', 2022, 'Automatic', 5, 4, 'Gray', 5100, 'available'),
        ('1G1BE5SM3H7123456', 'Chevrolet', 'Malibu', 2021, 'Automatic', 5, 4, 'White', 3900, 'available'),
        ('KNDJP3A59H7654321', 'Kia', 'Sorento', 2023, 'Automatic', 7, 4, 'Green', 5800, 'maintenance'),
        ('1N4AL3AP8JC987654', 'Nissan', 'Altima', 2022, 'Automatic', 5, 4, 'Blue', 4200, 'available'),
        ('2T1BURHE0JC111222', 'Tesla', 'Model 3', 2023, 'Automatic', 5, 4, 'Black', 7200, 'available')
    ]
    
    cursor.executemany(
        "INSERT OR IGNORE INTO cars (vin, make, model, year, transmission, seats, doors, color, daily_rate_cents, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        cars_data
    )
    print("✅ Added 10 cars to inventory")
    
    # Assign random features to cars
    cursor.execute("SELECT id FROM cars")
    car_ids = [row[0] for row in cursor.fetchall()]
    
    cursor.execute("SELECT id FROM features")
    feature_ids = [row[0] for row in cursor.fetchall()]
    
    # Assign 3-6 random features to each car
    car_features_data = []
    for car_id in car_ids:
        num_features = random.randint(3, 6)
        selected_features = random.sample(feature_ids, num_features)
        for feature_id in selected_features:
            car_features_data.append((car_id, feature_id))
    
    cursor.executemany(
        "INSERT OR IGNORE INTO car_features (car_id, feature_id) VALUES (?, ?)",
        car_features_data
    )
    print("✅ Assigned random features to cars")
    
    # Seed Users
    users_data = [
        ('John Smith', 'john.smith@email.com', '555-123-4567', 'hashed_password_1', 'customer'),
        ('Jane Doe', 'jane.doe@email.com', '555-234-5678', 'hashed_password_2', 'customer'),
        ('Mike Johnson', 'mike.johnson@email.com', '555-345-6789', 'hashed_password_3', 'customer'),
        ('Sarah Wilson', 'sarah.wilson@email.com', '555-456-7890', 'hashed_password_4', 'customer'),
        ('Admin User', 'admin@carrental.com', '555-000-0000', 'hashed_admin_password', 'admin'),
        ('David Brown', 'david.brown@email.com', '555-567-8901', 'hashed_password_5', 'customer'),
        ('Emily Davis', 'emily.davis@email.com', '555-678-9012', 'hashed_password_6', 'customer'),
        ('Chris Miller', 'chris.miller@email.com', '555-789-0123', 'hashed_password_7', 'customer')
    ]
    
    cursor.executemany(
        "INSERT OR IGNORE INTO users (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)",
        users_data
    )
    print("✅ Added 8 users (7 customers + 1 admin)")
    
    # Seed some sample reservations
    cursor.execute("SELECT id FROM users WHERE role = 'customer'")
    customer_ids = [row[0] for row in cursor.fetchall()]
    
    cursor.execute("SELECT id FROM cars WHERE status = 'available'")
    available_car_ids = [row[0] for row in cursor.fetchall()]
    
    # Create 5 sample reservations
    reservations_data = []
    base_date = datetime.now()
    
    for i in range(5):
        user_id = random.choice(customer_ids)
        car_id = random.choice(available_car_ids)
        
        # Random reservation dates (some past, some future)
        start_offset = random.randint(-30, 30)  # -30 to +30 days from now
        duration = random.randint(1, 14)  # 1-14 day rentals
        
        start_datetime = (base_date + timedelta(days=start_offset)).isoformat()
        end_datetime = (base_date + timedelta(days=start_offset + duration)).isoformat()
        
        status = random.choice(['confirmed', 'completed', 'pending'])
        
        reservations_data.append((user_id, car_id, start_datetime, end_datetime, status))
    
    # Insert reservations (getting daily_rate_cents from cars table)
    for reservation in reservations_data:
        cursor.execute("""
            INSERT INTO reservations (user_id, car_id, start_datetime, end_datetime, status, daily_rate_cents)
            VALUES (?, ?, ?, ?, ?, (SELECT daily_rate_cents FROM cars WHERE id = ?))
        """, (*reservation, reservation[1]))  # reservation[1] is car_id
    
    print("✅ Added 5 sample reservations")
    
    # Seed payments for confirmed/completed reservations
    cursor.execute("""
        SELECT id, daily_rate_cents, 
               julianday(end_datetime) - julianday(start_datetime) as days
        FROM reservations 
        WHERE status IN ('confirmed', 'completed')
    """)
    
    reservation_payments = cursor.fetchall()
    
    payments_data = []
    for res_id, daily_rate, days in reservation_payments:
        total_amount = int(daily_rate * days)
        status = 'paid' if random.random() > 0.1 else 'pending'  # 90% paid, 10% pending
        provider = random.choice(['stripe', 'paypal', 'test'])
        provider_ref = f"{provider}_ref_{random.randint(100000, 999999)}"
        
        payments_data.append((res_id, total_amount, 'USD', provider, provider_ref, status))
    
    cursor.executemany(
        "INSERT OR IGNORE INTO payments (reservation_id, amount_cents, currency, provider, provider_ref, status) VALUES (?, ?, ?, ?, ?, ?)",
        payments_data
    )
    print("✅ Added payments for reservations")
    
    # Commit all changes
    conn.commit()
    
    # Print summary
    cursor.execute("SELECT COUNT(*) FROM cars")
    car_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM users")
    user_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM reservations")
    reservation_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM features")
    feature_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM payments")
    payment_count = cursor.fetchone()[0]
    
    print(f"\n🎉 Database seeding completed!")
    print(f"📊 Summary:")
    print(f"   • Cars: {car_count}")
    print(f"   • Users: {user_count}")
    print(f"   • Features: {feature_count}")
    print(f"   • Reservations: {reservation_count}")
    print(f"   • Payments: {payment_count}")
    
    conn.close()

if __name__ == "__main__":
    seed_database()
