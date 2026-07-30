#! /usr/bin/env node
require("dotenv").config();
const { Client } = require("pg");

// SQL script to create tables and seed initial data
const SQL = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  membership_status BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  text TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);
`;

async function main() {
  console.log("Seeding database...");
  
  const connectionString = process.env.DATABASE_URL || process.argv[2];

  if (!connectionString) {
    console.error("Error: No connection string provided via DATABASE_URL or command argument.");
    process.exit(1);
  }

  const isProduction = process.env.NODE_ENV === "production";

  const client = new Client({
    connectionString: connectionString,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    await client.query(SQL);
    console.log("Database seeded successfully!");
  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    await client.end();
  }
}

main();