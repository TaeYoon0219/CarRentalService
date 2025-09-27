#!/usr/bin/env python3
"""
Dummy Data Population Script for Car Rental Database
This script populates all tables with 5 sample records each
"""

import sqlite3
import os
from datetime import datetime, timedelta
import random

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), 'carrental.db')

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def populate_users():
    """Populate users table with 5 sample users"""
    users_data = [
        ('John Smith', 'john.smith@email.com', '+1-555-0101', 'hashed_password_1', 'customer'),
        ('Emily Johnson', 'emily.johnson@email.com', '+1-555-0102', 'hashed_password_2', 'customer'),
        ('Michael Brown', 'michael.brown@email.com', '+1-555-0103', 'hashed_password_3', 'customer'),
        ('Sarah Davis', 'sarah.davis@email.com', '+1-555-0104', 'hashed_password_4', 'customer'),
        ('Admin User', 'admin@carrental.com', '+1-555-0100', 'hashed_admin_password', 'admin')
    ]
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    for user in users_data:
        cursor.execute('''
            INSERT INTO users (full_name, email, phone, password_hash, role)
            VALUES (?, ?, ?, ?, ?)
        ''', user)
    
    conn.commit()
    conn.close()
    print("✅ Added 5 users")

def populate_cars():
    """Populate cars table with 5 sample cars"""
    cars_data = [
        ('1HGBH41JXMN109186', 'Toyota', 'Camry', 2023, 'Automatic', 5, 4, 'Silver', 4500, 'available'),
        ('WBAVB13596PT12345', 'BMW', '3 Series', 2022, 'Automatic', 5, 4, 'Blue', 8500, 'available'),
        ('1FTPW12V16FA12345', 'Ford', 'F-150', 2021, 'Automatic', 5, 4, 'Black', 7500, 'available'),
        ('JH4KB16536C123456', 'Honda', 'Civic', 2023, 'Manual', 5, 4, 'White', 3500, 'available'),
        ('5NPE34AF6HH123456', 'Hyundai', 'Elantra', 2022, 'Automatic', 5, 4, 'Red', 3800, 'maintenance')
    ]
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    for car in cars_data:
        cursor.execute('''
            INSERT INTO cars (vin, make, model, year, transmission, seats, doors, color, daily_rate_cents, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', car)
    
    conn.commit()
    conn.close()
    print("✅ Added 5 cars")

def populate_features():
    """Populate features table with 5 sample features"""
    features_data = [
        ('bluetooth', 'Bluetooth Connectivity'),
        ('awd', 'All-Wheel Drive'),
        ('sunroof', 'Sunroof'),
        ('leather_seats', 'Leather Seats'),
        ('backup_camera', 'Backup Camera')
    ]
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    for feature in features_data:
        cursor.execute('''
            INSERT INTO features (key, name)
            VALUES (?, ?)
        ''', feature)
    
    conn.commit()
    conn.close()
    print("✅ Added 5 features")

def populate_car_features():
    """Populate car_features junction table"""
    # Assign random features to each car (car IDs 1-5, feature IDs 1-5)
    car_features_data = [
        (1, 1), (1, 5),  # Toyota Camry: Bluetooth, Backup Camera
        (2, 1), (2, 2), (2, 4),  # BMW 3 Series: Bluetooth, AWD, Leather Seats
        (3, 1), (3, 5),  # Ford F-150: Bluetooth, Backup Camera
        (4, 1),  # Honda Civic: Bluetooth
        (5, 1), (5, 3), (5, 5)  # Hyundai Elantra: Bluetooth, Sunroof, Backup Camera
    ]
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    for car_feature in car_features_data:
        cursor.execute('''
            INSERT INTO car_features (car_id, feature_id)
            VALUES (?, ?)
        ''', car_feature)
    
    conn.commit()
    conn.close()
    print("✅ Added car-feature relationships")

def populate_reservations():
    """Populate reservations table with 5 sample reservations"""
    # Generate dates for the reservations
    base_date = datetime.now()
    reservations_data = [
        (1, 1, (base_date + timedelta(days=1)).isoformat(), (base_date + timedelta(days=3)).isoformat(), 'confirmed', 4500),
        (2, 2, (base_date + timedelta(days=5)).isoformat(), (base_date + timedelta(days=7)).isoformat(), 'confirmed', 8500),
        (3, 3, (base_date + timedelta(days=-10)).isoformat(), (base_date + timedelta(days=-8)).isoformat(), 'completed', 7500),
        (4, 4, (base_date + timedelta(days=10)).isoformat(), (base_date + timedelta(days=12)).isoformat(), 'pending', 3500),
        (1, 1, (base_date + timedelta(days=20)).isoformat(), (base_date + timedelta(days=22)).isoformat(), 'cancelled', 4500)
    ]
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    for reservation in reservations_data:
        cursor.execute('''
            INSERT INTO reservations (user_id, car_id, start_datetime, end_datetime, status, daily_rate_cents)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', reservation)
    
    conn.commit()
    conn.close()
    print("✅ Added 5 reservations")

def populate_payments():
    """Populate payments table with 5 sample payments"""
    payments_data = [
        (1, 9000, 'USD', 'stripe', 'pi_1234567890', 'paid'),  # 2 days * 4500 cents
        (2, 17000, 'USD', 'stripe', 'pi_1234567891', 'paid'), # 2 days * 8500 cents
        (3, 15000, 'USD', 'stripe', 'pi_1234567892', 'paid'), # 2 days * 7500 cents
        (4, 7000, 'USD', 'test', 'test_payment_123', 'pending'), # 2 days * 3500 cents
        (5, 9000, 'USD', 'stripe', 'pi_1234567893', 'refunded') # 2 days * 4500 cents
    ]
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    for payment in payments_data:
        cursor.execute('''
            INSERT INTO payments (reservation_id, amount_cents, currency, provider, provider_ref, status)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', payment)
    
    conn.commit()
    conn.close()
    print("✅ Added 5 payments")

def clear_all_tables():
    """Clear all tables before populating with new data"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Disable foreign key constraints temporarily
    cursor.execute('PRAGMA foreign_keys = OFF')
    
    # Clear all tables in reverse dependency order
    tables = ['payments', 'reservations', 'car_features', 'features', 'cars', 'users']
    
    for table in tables:
        cursor.execute(f'DELETE FROM {table}')
        print(f"🗑️  Cleared {table} table")
    
    # Reset auto-increment counters
    cursor.execute('DELETE FROM sqlite_sequence')
    
    # Re-enable foreign key constraints
    cursor.execute('PRAGMA foreign_keys = ON')
    
    conn.commit()
    conn.close()
    print("✅ All tables cleared")

def verify_data():
    """Verify that data was inserted correctly"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    tables = ['users', 'cars', 'features', 'car_features', 'reservations', 'payments']
    
    print("\n📊 Data verification:")
    print("=" * 50)
    
    for table in tables:
        cursor.execute(f'SELECT COUNT(*) FROM {table}')
        count = cursor.fetchone()[0]
        print(f"{table:15}: {count} records")
    
    conn.close()

def main():
    """Main function to populate all tables"""
    print("🚗 Car Rental Database - Dummy Data Population")
    print("=" * 50)
    
    try:
        # Check if database exists
        if not os.path.exists(DB_PATH):
            print("❌ Database not found! Please run the backend server first to create the database.")
            return
        
        print("🗑️  Clearing existing data...")
        clear_all_tables()
        
        print("\n📝 Populating tables with dummy data...")
        populate_users()
        populate_cars()
        populate_features()
        populate_car_features()
        populate_reservations()
        populate_payments()
        
        verify_data()
        
        print("\n🎉 Successfully populated all tables with dummy data!")
        print("🔗 You can now start the frontend to see the cars in action.")
        
    except Exception as e:
        print(f"❌ Error populating database: {str(e)}")
        raise

if __name__ == "__main__":
    main()
