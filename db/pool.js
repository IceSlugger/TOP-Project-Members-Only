require("dotenv").config();
const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  // Use DATABASE_URL if available (Render), otherwise fall back to local connection
  connectionString: process.env.DATABASE_URL,
  
  // Render requires SSL connections in production
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

module.exports = pool;