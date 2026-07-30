const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";

// On Render, process.env.DATABASE_URL will be set.
// If it's missing in production, this will throw a clear error instead of falling back to 127.0.0.1.
const connectionString = process.env.DATABASE_URL;

if (isProduction && !connectionString) {
  console.error("FATAL ERROR: DATABASE_URL is not defined in Render environment variables!");
}

const pool = new Pool({
  connectionString: connectionString || "postgresql://localhost:5432/members_only",
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

module.exports = pool;