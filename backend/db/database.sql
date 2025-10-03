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
  email         TEXT NOT NULL,
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
INSERT INTO cars (vin, make, model, year, transmission, seats, doors, color, daily_rate_cents, status) VALUES
  ('1HGCM82633A004352','Toyota','Camry',2022,'Automatic',5,4,'Silver',4999,'available'),
  ('1HGCM82633A004353','Toyota','Corolla',2021,'Automatic',5,4,'Blue',4299,'available'),
  ('1HGCM82633A004354','Toyota','RAV4',2023,'Automatic',5,4,'White',5899,'available'),
  ('1HGCM82633A004355','Honda','Civic',2020,'Manual',5,4,'Red',4499,'available'),
  ('1HGCM82633A004356','Honda','CR-V',2022,'Automatic',5,4,'Gray',5699,'available'),
  ('1HGCM82633A004357','Ford','Explorer',2021,'Automatic',7,4,'Black',6499,'available'),
  ('1HGCM82633A004358','Ford','F-150',2022,'Automatic',5,4,'White',6599,'available'),
  ('1HGCM82633A004359','Subaru','Outback',2023,'Automatic',5,4,'Green',5999,'available'),
  ('1HGCM82633A004360','Jeep','Wrangler',2019,'Manual',5,4,'Yellow',6199,'maintenance'),
  ('1HGCM82633A004361','BMW','330i',2021,'Automatic',5,4,'Blue',8999,'available'),
  ('1HGCM82633A004362','Mercedes-Benz','C300',2022,'Automatic',5,4,'Black',9499,'available'),
  ('1HGCM82633A004363','Nissan','Altima',2020,'Automatic',5,4,'Gray',4699,'available'),
  ('1HGCM82633A004364','Hyundai','Tucson',2023,'Automatic',5,4,'White',5199,'available'),
  ('1HGCM82633A004365','Kia','Sorento',2022,'Automatic',7,4,'Dark Gray',5699,'available'),
  ('1HGCM82633A004366','Chevrolet','Bolt EUV',2023,'Automatic',5,4,'Teal',5799,'available'),
  ('1HGCM82633A004367','Volkswagen','Jetta',2019,'Manual',5,4,'Silver',3999,'retired'),
  ('1HGCM82633A004368','Mazda','CX-5',2021,'Automatic',5,4,'Red',5499,'available'),
  ('1HGCM82633A004369','Dodge','Grand Caravan',2020,'Automatic',7,4,'White',5299,'available'),
  ('5YJ3E1EA7KF317001','Tesla','Model 3',2023,'Automatic',5,4,'White',9499,'available'),
  ('LRWYGCEK0PC123456','Tesla','Model Y',2024,'Automatic',5,4,'Midnight Silver',10999,'available');


-- ===== Seed data: car_features =====
-- We use subqueries to look up car_id and feature_id dynamically by VIN and feature key.
-- This protects against AUTOINCREMENT ID shifts on reseed and prevents FK mismatches.

-- Toyota Camry 2022 — mainstream sedan w/ modern infotainment
INSERT INTO car_features (car_id, feature_id) VALUES
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004352'), (SELECT id FROM features WHERE key='bluetooth')),
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004352'), (SELECT id FROM features WHERE key='apple_carplay')),
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004352'), (SELECT id FROM features WHERE key='android_auto')),
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004352'), (SELECT id FROM features WHERE key='backup_camera'));

-- Toyota Corolla 2021 — economy sedan; basic comfort/safety
INSERT INTO car_features (car_id, feature_id) VALUES
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004353'), (SELECT id FROM features WHERE key='bluetooth')),
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004353'), (SELECT id FROM features WHERE key='cruise_control')),
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004353'), (SELECT id FROM features WHERE key='backup_camera'));

-- Toyota RAV4 2023 — compact SUV geared for light outdoors
INSERT INTO car_features (car_id, feature_id) VALUES
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004354'), (SELECT id FROM features WHERE key='awd')),
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004354'), (SELECT id FROM features WHERE key='roof_rack')),
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004354'), (SELECT id FROM features WHERE key='apple_carplay')),
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004354'), (SELECT id FROM features WHERE key='backup_camera'));

-- Honda Civic 2020 (Manual) — simple, driver-focused, connected
INSERT INTO car_features (car_id, feature_id) VALUES
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004355'), (SELECT id FROM features WHERE key='bluetooth')),
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004355'), (SELECT id FROM features WHERE key='cruise_control'));

-- Honda CR-V 2022 — family SUV w/ comfort + safety
INSERT INTO car_features (car_id, feature_id) VALUES
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004356'), (SELECT id FROM features WHERE key='awd')),
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004356'), (SELECT id FROM features WHERE key='heated_seats')),
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004356'), (SELECT id FROM features WHERE key='backup_camera'));

-- Ford Explorer 2021 — 3rd row + nav for road trips
INSERT INTO car_features (car_id, feature_id) VALUES
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004357'), (SELECT id FROM features WHERE key='third_row')),
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004357'), (SELECT id FROM features WHERE key='awd')),
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004357'), (SELECT id FROM features WHERE key='navigation'));

-- Ford F-150 2022 — work-capable; towing + convenience
INSERT INTO car_features (car_id, feature_id) VALUES
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004358'), (SELECT id FROM features WHERE key='tow_package')),
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004358'), (SELECT id FROM features WHERE key='remote_start')),
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004358'), (SELECT id FROM features WHERE key='backup_camera'));

-- Subaru Outback 2023 — adventure wagon; AWD + rack + warmth
INSERT INTO car_features (car_id, feature_id) VALUES
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004359'), (SELECT id FROM features WHERE key='awd')),
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004359'), (SELECT id FROM features WHERE key='roof_rack')),
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004359'), (SELECT id FROM features WHERE key='heated_seats'));

-- Jeep Wrangler 2019 (Manual) — off-road oriented basics
INSERT INTO car_features (car_id, feature_id) VALUES
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004360'), (SELECT id FROM features WHERE key='awd')),
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004360'), (SELECT id FROM features WHERE key='roof_rack'));

-- BMW 330i 2021 — luxury/comfort tech stack
INSERT INTO car_features (car_id, feature_id) VALUES
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004361'), (SELECT id FROM features WHERE key='navigation')),
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004361'), (SELECT id FROM features WHERE key='sunroof')),
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004361'), (SELECT id FROM features WHERE key='heated_seats')),
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004361'), (SELECT id FROM features WHERE key='keyless_entry'));

-- Mercedes-Benz C300 2022 — luxury parallel to 330i
INSERT INTO car_features (car_id, feature_id) VALUES
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004362'), (SELECT id FROM features WHERE key='navigation')),
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004362'), (SELECT id FROM features WHERE key='sunroof')),
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004362'), (SELECT id FROM features WHERE key='heated_seats'));

-- Nissan Altima 2020 — mainstream sedan; app mirroring + camera
INSERT INTO car_features (car_id, feature_id) VALUES
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004363'), (SELECT id FROM features WHERE key='apple_carplay')),
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004363'), (SELECT id FROM features WHERE key='android_auto')),
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004363'), (SELECT id FROM features WHERE key='backup_camera'));

-- Hyundai Tucson 2023 — modern compact SUV; ports + apps
INSERT INTO car_features (car_id, feature_id) VALUES
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004364'), (SELECT id FROM features WHERE key='apple_carplay')),
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004364'), (SELECT id FROM features WHERE key='android_auto')),
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004364'), (SELECT id FROM features WHERE key='usb_c'));

-- Kia Sorento 2022 — family SUV with 3rd row + safety
INSERT INTO car_features (car_id, feature_id) VALUES
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004365'), (SELECT id FROM features WHERE key='third_row')),
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004365'), (SELECT id FROM features WHERE key='backup_camera'));

-- Chevrolet Bolt EUV 2023 — EV + modern infotainment
INSERT INTO car_features (car_id, feature_id) VALUES
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004366'), (SELECT id FROM features WHERE key='ev')),
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004366'), (SELECT id FROM features WHERE key='apple_carplay')),
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004366'), (SELECT id FROM features WHERE key='android_auto'));

-- Volkswagen Jetta 2019 (Manual, retired) — basic connectivity
INSERT INTO car_features (car_id, feature_id) VALUES
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004367'), (SELECT id FROM features WHERE key='bluetooth'));

-- Mazda CX-5 2021 — AWD comfort crossover
INSERT INTO car_features (car_id, feature_id) VALUES
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004368'), (SELECT id FROM features WHERE key='awd')),
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004368'), (SELECT id FROM features WHERE key='heated_seats'));

-- Dodge Grand Caravan 2020 — people mover + camera
INSERT INTO car_features (car_id, feature_id) VALUES
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004369'), (SELECT id FROM features WHERE key='third_row')),
  ((SELECT id FROM cars WHERE vin='1HGCM82633A004369'), (SELECT id FROM features WHERE key='backup_camera'));

-- Tesla Model 3 2023 — EV + built-in nav + modern I/O
INSERT INTO car_features (car_id, feature_id) VALUES
  ((SELECT id FROM cars WHERE vin='5YJ3E1EA7KF317001'), (SELECT id FROM features WHERE key='ev')),
  ((SELECT id FROM cars WHERE vin='5YJ3E1EA7KF317001'), (SELECT id FROM features WHERE key='navigation')),
  ((SELECT id FROM cars WHERE vin='5YJ3E1EA7KF317001'), (SELECT id FROM features WHERE key='usb_c'));

-- Tesla Model Y 2024 — EV crossover; nav + keyless + I/O
INSERT INTO car_features (car_id, feature_id) VALUES
  ((SELECT id FROM cars WHERE vin='LRWYGCEK0PC123456'), (SELECT id FROM features WHERE key='ev')),
  ((SELECT id FROM cars WHERE vin='LRWYGCEK0PC123456'), (SELECT id FROM features WHERE key='navigation')),
  ((SELECT id FROM cars WHERE vin='LRWYGCEK0PC123456'), (SELECT id FROM features WHERE key='keyless_entry')),
  ((SELECT id FROM cars WHERE vin='LRWYGCEK0PC123456'), (SELECT id FROM features WHERE key='usb_c'));


ALTER TABLE Car ADD COLUMN image_url VARCHAR(500);