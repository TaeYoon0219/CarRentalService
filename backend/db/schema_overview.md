# Car Rental Database Schema Overview

## Database Information

- **Database Type:** SQLite
- **File:** `carrental.db`
- **Total Tables:** 6
- **Foreign Keys:** Enabled
- **Created:** Auto-generated from `database.sql`

## Table Structure

### 1. 👥 **users**

Stores customer and admin account information.

| Column          | Type     | Constraints                         | Description                 |
| --------------- | -------- | ----------------------------------- | --------------------------- |
| `id`            | INTEGER  | PRIMARY KEY, AUTOINCREMENT          | Unique user identifier      |
| `full_name`     | TEXT     | NOT NULL                            | User's full name            |
| `email`         | TEXT     | NOT NULL, UNIQUE                    | User's email address        |
| `phone`         | TEXT     | -                                   | Optional phone number       |
| `password_hash` | TEXT     | NOT NULL                            | Hashed password             |
| `role`          | TEXT     | NOT NULL, DEFAULT 'customer'        | Role: 'customer' or 'admin' |
| `created_at`    | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Account creation timestamp  |

**Indexes:**

- `idx_users_email` on `email`

---

### 2. 🚗 **cars**

Vehicle inventory with specifications and pricing.

| Column             | Type    | Constraints                                          | Description                                   |
| ------------------ | ------- | ---------------------------------------------------- | --------------------------------------------- |
| `id`               | INTEGER | PRIMARY KEY, AUTOINCREMENT                           | Unique car identifier                         |
| `vin`              | TEXT    | NOT NULL, UNIQUE                                     | Vehicle Identification Number                 |
| `make`             | TEXT    | NOT NULL                                             | Car manufacturer (e.g., Toyota)               |
| `model`            | TEXT    | NOT NULL                                             | Car model (e.g., Camry)                       |
| `year`             | INTEGER | NOT NULL                                             | Manufacturing year                            |
| `transmission`     | TEXT    | CHECK IN ('Automatic','Manual'), DEFAULT 'Automatic' | Transmission type                             |
| `seats`            | INTEGER | NOT NULL, DEFAULT 5                                  | Number of seats                               |
| `doors`            | INTEGER | NOT NULL, DEFAULT 4                                  | Number of doors                               |
| `color`            | TEXT    | -                                                    | Vehicle color                                 |
| `daily_rate_cents` | INTEGER | NOT NULL                                             | Daily rental rate in cents                    |
| `status`           | TEXT    | NOT NULL, DEFAULT 'available'                        | Status: 'available', 'maintenance', 'retired' |

**Indexes:**

- `idx_cars_status` on `status`

---

### 3. ⭐ **features**

Available car features (e.g., Bluetooth, AWD).

| Column | Type    | Constraints                | Description                            |
| ------ | ------- | -------------------------- | -------------------------------------- |
| `id`   | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique feature identifier              |
| `key`  | TEXT    | NOT NULL, UNIQUE           | Feature key (e.g., 'bluetooth', 'awd') |
| `name` | TEXT    | NOT NULL                   | Human-readable feature name            |

---

### 4. 🔗 **car_features**

Junction table linking cars to their features (many-to-many relationship).

| Column       | Type    | Constraints           | Description              |
| ------------ | ------- | --------------------- | ------------------------ |
| `car_id`     | INTEGER | NOT NULL, FOREIGN KEY | References `cars.id`     |
| `feature_id` | INTEGER | NOT NULL, FOREIGN KEY | References `features.id` |

**Primary Key:** Composite key (`car_id`, `feature_id`)

**Foreign Keys:**

- `car_id` → `cars(id)` ON DELETE CASCADE
- `feature_id` → `features(id)` ON DELETE CASCADE

---

### 5. 📅 **reservations**

Booking records for car rentals.

| Column             | Type     | Constraints                         | Description                                              |
| ------------------ | -------- | ----------------------------------- | -------------------------------------------------------- |
| `id`               | INTEGER  | PRIMARY KEY, AUTOINCREMENT          | Unique reservation identifier                            |
| `user_id`          | INTEGER  | NOT NULL, FOREIGN KEY               | References `users.id`                                    |
| `car_id`           | INTEGER  | NOT NULL, FOREIGN KEY               | References `cars.id`                                     |
| `start_datetime`   | DATETIME | NOT NULL                            | Rental start date/time                                   |
| `end_datetime`     | DATETIME | NOT NULL                            | Rental end date/time                                     |
| `status`           | TEXT     | NOT NULL, DEFAULT 'pending'         | Status: 'pending', 'confirmed', 'cancelled', 'completed' |
| `daily_rate_cents` | INTEGER  | NOT NULL                            | Daily rate at time of booking (cents)                    |
| `created_at`       | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Reservation creation timestamp                           |

**Constraints:**

- `CHECK (end_datetime > start_datetime)` - Ensures valid date range

**Foreign Keys:**

- `user_id` → `users(id)` ON DELETE CASCADE
- `car_id` → `cars(id)` ON DELETE RESTRICT

**Indexes:**

- `idx_reservations_car_time` on `(car_id, start_datetime, end_datetime)`
- `idx_reservations_user` on `user_id`

---

### 6. 💳 **payments**

Payment processing records for reservations.

| Column           | Type     | Constraints                         | Description                                     |
| ---------------- | -------- | ----------------------------------- | ----------------------------------------------- |
| `id`             | INTEGER  | PRIMARY KEY, AUTOINCREMENT          | Unique payment identifier                       |
| `reservation_id` | INTEGER  | NOT NULL, UNIQUE, FOREIGN KEY       | References `reservations.id`                    |
| `amount_cents`   | INTEGER  | NOT NULL                            | Payment amount in cents                         |
| `currency`       | TEXT     | NOT NULL, DEFAULT 'USD'             | Payment currency                                |
| `provider`       | TEXT     | NOT NULL                            | Payment provider (e.g., 'stripe', 'test')       |
| `provider_ref`   | TEXT     | -                                   | Provider's transaction reference                |
| `status`         | TEXT     | NOT NULL, DEFAULT 'paid'            | Status: 'paid', 'failed', 'refunded', 'pending' |
| `created_at`     | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Payment timestamp                               |

**Foreign Keys:**

- `reservation_id` → `reservations(id)` ON DELETE CASCADE

## Entity Relationships

```
users (1) ────── (*) reservations (*) ────── (1) cars
                        │
                        │ (1)
                        │
                        │
                   (*) payments (1)

cars (*) ────── (*) car_features (*) ────── (*) features
```

### Relationship Details:

- **User → Reservations:** One user can have many reservations (1:N)
- **Car → Reservations:** One car can have many reservations (1:N)
- **Reservation → Payment:** One reservation has one payment (1:1)
- **Car → Features:** Many-to-many through `car_features` junction table

## Database Initialization

The database schema is automatically initialized from `database.sql` when:

1. The database file doesn't exist
2. The `cars` table is missing
3. Environment variable `RESET_DB=1` is set

## Current Data Status

- All tables exist but are currently empty
- Ready for data population through API endpoints or seed scripts

## API Endpoints Available

- `GET /api/cars` - Retrieve all cars
- `POST /api/users` - Create new user
- `POST /api/reservations` - Create new reservation

## Notes

- All monetary values stored in cents for precision
- Foreign key constraints are enabled
- Proper indexing for performance optimization
- Role-based access control ready (customer/admin roles)
