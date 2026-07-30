const pool = require("./pool");

// Get all messages with author names
async function getAllMessages() {
  const { rows } = await pool.query(
    `SELECT messages.id, messages.title, messages.text, messages.timestamp, 
            users.first_name, users.last_name 
     FROM messages 
     JOIN users ON messages.user_id = users.id 
     ORDER BY messages.timestamp DESC`
  );
  return rows;
}

// Create a new message
async function createMessage(title, text, userId) {
  await pool.query(
    "INSERT INTO messages (title, text, user_id) VALUES ($1, $2, $3)",
    [title, text, userId]
  );
}

// Grant user admin status
async function makeUserAdmin(userId) {
  await pool.query("UPDATE users SET is_admin = TRUE WHERE id = $1", [userId]);
}

// Delete a message by ID
async function deleteMessageById(messageId) {
  await pool.query("DELETE FROM messages WHERE id = $1", [messageId]);
}

module.exports = {
  getAllMessages,
  createMessage,
  makeUserAdmin,
  deleteMessageById,
};