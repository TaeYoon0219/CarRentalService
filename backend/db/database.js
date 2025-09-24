// backend/db/database.js
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const DB_PATH = path.join(__dirname, "carrental.db");
const SCHEMA_PATH = path.join(__dirname, "database.sql");

const db = new Database(DB_PATH);

// Run schema if cars table doesn't exist, or if you set RESET_DB=1
function ensureSchema() {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='cars'")
    .get();

  if (!row || process.env.RESET_DB === "1") {
    const sql = fs.readFileSync(SCHEMA_PATH, "utf8");
    db.exec(sql);
    console.log("[DB] Schema loaded from database.sql");
  }
}

ensureSchema();

module.exports = db;