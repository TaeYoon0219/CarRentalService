// backend/db/database.js

// import system to read files & path module to work with file paths
const fs = require("fs");
const path = require("path");
// import better-sqlite3 which is a fastsqlite library
const Database = require("better-sqlite3");

// build file paths for the databse file and schema file
const DB_PATH = path.join(__dirname, "carrental.db");
const SCHEMA_PATH = path.join(__dirname, "database.sql");

// open/create db file using better-sqlite3
const db = new Database(DB_PATH);

// function to make sure db has the right tables and structure
function ensureSchema() {
  // check if 'cars' table exists by asking for table names
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='cars'")
    .get();

  // if it doesn't exist or reset_db=1, in env variables, 
  // then reload schema from db.sql to create tables fresh
  if (!row || process.env.RESET_DB === "1") {
    const sql = fs.readFileSync(SCHEMA_PATH, "utf8");
    db.exec(sql);
    console.log("[DB] Schema loaded from database.sql");
  }
}

// call function once when the file runs so db is ready
ensureSchema();

// export the db object so other files can use it (which can be imported using require)
module.exports = db;