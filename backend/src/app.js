// loads express library which makes building web servers easy 
// - takes requests and brings back responses
const express = require('express');
const path = require('path');
// creates an instance of the express app (server). now requests can come in
const app = express();

// Serve static files from uploads folder
// This allows images to be accessed via URL
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Import and use image routes
const imageRoutes = require('./routes/images');
app.use('/api/images', imageRoutes);


// imports db object from db.js file. without it, it wouldn't know how to run sql commands
const db = require("../db/database"); // <- import connector


// tells express to turn json data sent by client into usable javascript object
app.use(express.json());

// when someone is on the api/cars portion of website, it gets all rows from cars table
app.get("/api/cars", (req, res) => {
  const cars = db.prepare("SELECT * FROM cars").all();
  res.json(cars);
});

// Users -- inserts data into users table in db
app.post("/api/users", (req, res) => {
  const { full_name, email, password_hash } = req.body;
  const info = db
    .prepare("INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)")
    .run(full_name, email, password_hash);
  res.json({ id: info.lastInsertRowid, full_name, email });
});

// Reservations -- inserts info into the reservations table
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

// starts the server on port 3001 and makes it live to handle requests
app.listen(3001, () => console.log("API running on http://localhost:3001"));
