const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";

// If DATABASE_URL is present (on Render), use it directly.
// In production, require connectionString so pg never falls back to localhost.
const connectionString = process.env.DATABASE_URL;

if (isProduction && !connectionString) {
  console.error("FATAL: DATABASE_URL environment variable is missing on Render!");
}

const pool = new Pool({
  connectionString: connectionString || "postgresql://localhost:5432/members_only",
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

module.exports = pool;