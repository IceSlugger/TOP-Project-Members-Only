require("dotenv").config();
const { Client } = require("pg");
const bcrypt = require("bcryptjs");

const SQL = `
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  membership_status BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE messages (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  text TEXT NOT NULL,
  user_id INT REFERENCES users(id) ON DELETE CASCADE
);
`;

async function main() {
  console.log("Seeding database with sample messages...");
  const dbUrl = process.env.DATABASE_URL;

  const clientConfig = dbUrl
    ? { connectionString: dbUrl, ssl: { rejectUnauthorized: false } }
    : {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
      };

  const client = new Client(clientConfig);

  try {
    await client.connect();
    await client.query(SQL);

    const hashedPw = await bcrypt.hash("password123", 10);

    // Create sample users
    const userRes = await client.query(
      `INSERT INTO users (first_name, last_name, username, password, membership_status, is_admin)
       VALUES 
       ('Alex', 'Rivers', 'alex@clubhouse.dev', $1, TRUE, TRUE),
       ('Sarah', 'Chen', 'sarah@odin.com', $1, TRUE, FALSE),
       ('John', 'Doe', 'john@gmail.com', $1, FALSE, FALSE)
       RETURNING id;`,
      [hashedPw]
    );

    const alexId = userRes.rows[0].id;
    const sarahId = userRes.rows[1].id;

    // Create sample messages
    await client.query(
      `INSERT INTO messages (title, text, user_id) VALUES
       ('🚀 Welcome to the Clubhouse!', 'Hey everyone! Super excited to launch this platform. Remember: only official members can see who posted what!', $1),
       ('Secret Passcode Reminder', 'For anyone looking to upgrade to full membership status, check out the Join Club option in the navigation menu!', $1),
       ('JavaScript & Node.js Discussion', 'Working through the TOP curriculum has been amazing so far. Express + Passport makes auth so smooth once it clicks.', $2);`,
      [alexId, sarahId]
    );

    console.log("Database seeded successfully with sample data!");
  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    await client.end();
  }
}

main();