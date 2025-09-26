PRAGMA foreign_keys = ON;

-- ===== Drop (for dev resets) =====
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS car_features;
DROP TABLE IF EXISTS features;
DROP TABLE IF EXISTS cars;
DROP TABLE IF EXISTS users;

-- ===== Core tables =====

-- users db
CREATE TABLE users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  phone         TEXT,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'customer', -- 'customer' | 'admin'
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- create db for cars and their specs
CREATE TABLE cars (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  vin              TEXT NOT NULL UNIQUE,
  make             TEXT NOT NULL,
  model            TEXT NOT NULL,
  year             INTEGER NOT NULL,
  transmission     TEXT CHECK (transmission IN ('Automatic','Manual')) DEFAULT 'Automatic',
  seats            INTEGER NOT NULL DEFAULT 5,
  doors            INTEGER NOT NULL DEFAULT 4,
  color            TEXT,
  daily_rate_cents INTEGER NOT NULL,
  status           TEXT NOT NULL DEFAULT 'available' -- available | maintenance | retired
);

CREATE TABLE features (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  key  TEXT NOT NULL UNIQUE, -- e.g. 'bluetooth', 'awd'
  name TEXT NOT NULL
);

CREATE TABLE car_features (
  car_id     INTEGER NOT NULL,
  feature_id INTEGER NOT NULL,
  PRIMARY KEY (car_id, feature_id),
  FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
  FOREIGN KEY (feature_id) REFERENCES features(id) ON DELETE CASCADE
);

-- create reservations for users
CREATE TABLE reservations (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id          INTEGER NOT NULL,
  car_id           INTEGER NOT NULL,
  start_datetime   DATETIME NOT NULL,
  end_datetime     DATETIME NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending', -- pending | confirmed | cancelled | completed
  daily_rate_cents INTEGER NOT NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE RESTRICT,
  CHECK (end_datetime > start_datetime)
);

-- get payments for each user
CREATE TABLE payments (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  reservation_id  INTEGER NOT NULL UNIQUE,
  amount_cents    INTEGER NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'USD',
  provider        TEXT NOT NULL,                 -- e.g., 'test'
  provider_ref    TEXT,
  status          TEXT NOT NULL DEFAULT 'paid',  -- paid | failed | refunded | pending
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
);

-- ===== Indexes =====
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_cars_status ON cars(status);
CREATE INDEX idx_reservations_car_time ON reservations(car_id, start_datetime, end_datetime);
CREATE INDEX idx_reservations_user ON reservations(user_id);

-- ===== insert into data: =====
