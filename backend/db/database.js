import mysql from "mysql2/promise";

// Create a connection pool (lets you reuse connections efficiently)
const pool = mysql.createPool({
  host: "localhost",       // database host (use your DB server address)
  user: "root",            // your MySQL username
  password: "yourpassword",// your MySQL password
  database: "car_rental",  // name of the database you created
});

export default pool;