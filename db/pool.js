const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";

// On Render, process.env.DATABASE_URL will exist.
// Locally, it will fall back to your individual DB variables.
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: isProduction ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.DB_HOST || "127.0.0.1",
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 5432,
      }
);

module.exports = pool;