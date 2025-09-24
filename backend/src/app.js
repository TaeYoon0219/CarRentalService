const express = require("express");
const db = require("../db/database"); // <- import connector
const app = express();

app.use(express.json());

// Cars
app.get("/api/cars", (req, res) => {
  const cars = db.prepare("SELECT * FROM cars").all();
  res.json(cars);
});

// Users
app.post("/api/users", (req, res) => {
  const { full_name, email, password_hash } = req.body;
  const info = db
    .prepare("INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)")
    .run(full_name, email, password_hash);
  res.json({ id: info.lastInsertRowid, full_name, email });
});

// Reservations
app.post("/api/reservations", (req, res) => {
  const { user_id, car_id, start_datetime, end_datetime } = req.body;
  const info = db
    .prepare(
      `INSERT INTO reservations (user_id, car_id, start_datetime, end_datetime, daily_rate_cents, status)
       VALUES (?, ?, ?, ?, (SELECT daily_rate_cents FROM cars WHERE id = ?), 'confirmed')`
    )
    .run(user_id, car_id, start_datetime, end_datetime, car_id);

  res.json({ id: info.lastInsertRowid });
});

app.listen(3001, () => console.log("API running on http://localhost:3001"));
