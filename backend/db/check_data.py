#!/usr/bin/env python3
"""
Database Data Verification Script
This script checks all tables and displays their contents
"""

import sqlite3
import os
from datetime import datetime

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), 'carrental.db')

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def check_users():
    """Check users table"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users')
    users = cursor.fetchall()
    
    print("👥 USERS TABLE:")
    print("-" * 80)
    if users:
        for user in users:
            print(f"ID: {user['id']}, Name: {user['full_name']}, Email: {user['email']}, Role: {user['role']}")
    else:
        print("No users found")
    
    conn.close()
    print(f"Total users: {len(users)}\n")

def check_cars():
    """Check cars table"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM cars')
    cars = cursor.fetchall()
    
    print("🚗 CARS TABLE:")
    print("-" * 80)
    if cars:
        for car in cars:
            price = car['daily_rate_cents'] / 100
            print(f"ID: {car['id']}, {car['make']} {car['model']} ({car['year']}), "
                  f"Color: {car['color']}, Price: ${price:.2f}/day, Status: {car['status']}")
    else:
        print("No cars found")
    
    conn.close()
    print(f"Total cars: {len(cars)}\n")

def check_features():
    """Check features table"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM features')
    features = cursor.fetchall()
    
    print("⭐ FEATURES TABLE:")
    print("-" * 80)
    if features:
        for feature in features:
            print(f"ID: {feature['id']}, Key: {feature['key']}, Name: {feature['name']}")
    else:
        print("No features found")
    
    conn.close()
    print(f"Total features: {len(features)}\n")

def check_car_features():
    """Check car_features junction table with detailed info"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT cf.car_id, cf.feature_id, c.make, c.model, f.name as feature_name
        FROM car_features cf
        JOIN cars c ON cf.car_id = c.id
        JOIN features f ON cf.feature_id = f.id
        ORDER BY cf.car_id
    ''')
    car_features = cursor.fetchall()
    
    print("🔗 CAR-FEATURES RELATIONSHIPS:")
    print("-" * 80)
    if car_features:
        current_car_id = None
        for cf in car_features:
            if cf['car_id'] != current_car_id:
                current_car_id = cf['car_id']
                print(f"\n{cf['make']} {cf['model']} (Car ID: {cf['car_id']}):")
            print(f"  • {cf['feature_name']}")
    else:
        print("No car-feature relationships found")
    
    conn.close()
    print(f"\nTotal car-feature relationships: {len(car_features)}\n")

def check_reservations():
    """Check reservations table with user and car details"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT r.*, u.full_name, c.make, c.model
        FROM reservations r
        JOIN users u ON r.user_id = u.id
        JOIN cars c ON r.car_id = c.id
        ORDER BY r.created_at DESC
    ''')
    reservations = cursor.fetchall()
    
    print("📅 RESERVATIONS TABLE:")
    print("-" * 80)
    if reservations:
        for res in reservations:
            price = res['daily_rate_cents'] / 100
            print(f"ID: {res['id']}, User: {res['full_name']}, "
                  f"Car: {res['make']} {res['model']}, "
                  f"From: {res['start_datetime'][:10]}, To: {res['end_datetime'][:10]}, "
                  f"Status: {res['status']}, Rate: ${price:.2f}/day")
    else:
        print("No reservations found")
    
    conn.close()
    print(f"Total reservations: {len(reservations)}\n")

def check_payments():
    """Check payments table with reservation details"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT p.*, u.full_name, c.make, c.model
        FROM payments p
        JOIN reservations r ON p.reservation_id = r.id
        JOIN users u ON r.user_id = u.id
        JOIN cars c ON r.car_id = c.id
        ORDER BY p.created_at DESC
    ''')
    payments = cursor.fetchall()
    
    print("💳 PAYMENTS TABLE:")
    print("-" * 80)
    if payments:
        for payment in payments:
            amount = payment['amount_cents'] / 100
            print(f"ID: {payment['id']}, User: {payment['full_name']}, "
                  f"Car: {payment['make']} {payment['model']}, "
                  f"Amount: ${amount:.2f}, Provider: {payment['provider']}, "
                  f"Status: {payment['status']}")
    else:
        print("No payments found")
    
    conn.close()
    print(f"Total payments: {len(payments)}\n")

def check_table_counts():
    """Get count of records in each table"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    tables = ['users', 'cars', 'features', 'car_features', 'reservations', 'payments']
    
    print("📊 TABLE SUMMARY:")
    print("=" * 50)
    
    total_records = 0
    for table in tables:
        cursor.execute(f'SELECT COUNT(*) FROM {table}')
        count = cursor.fetchone()[0]
        total_records += count
        print(f"{table:15}: {count:>3} records")
    
    print("-" * 50)
    print(f"{'TOTAL':15}: {total_records:>3} records")
    
    conn.close()

def main():
    """Main function to check all tables"""
    print("🔍 Car Rental Database - Data Verification")
    print("=" * 80)
    
    try:
        # Check if database exists
        if not os.path.exists(DB_PATH):
            print("❌ Database not found!")
            return
        
        print(f"📍 Database: {DB_PATH}")
        print(f"📅 Check time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("\n")
        
        # Check each table
        check_users()
        check_cars()
        check_features()
        check_car_features()
        check_reservations()
        check_payments()
        
        # Summary
        check_table_counts()
        
        print("\n✅ Database verification completed!")
        
    except Exception as e:
        print(f"❌ Error checking database: {str(e)}")
        raise

if __name__ == "__main__":
    main()
