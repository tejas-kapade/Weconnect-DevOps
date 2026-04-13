const db = require("../config/db");

exports.sendMessage = async (poolId, senderId, message) => {
    const [result] = await db.query(
        "INSERT INTO messages (pool_id, sender_id, message) VALUES (?, ?, ?)",
        [poolId, senderId, message]
    );

    return result;
};

//Fetch messages 
exports.getMessages = async (poolId) => {
    const [rows] = await db.query(
        `SELECT m.id, m.message, m.created_at, u.username
         FROM messages m
         JOIN users u ON m.sender_id = u.id
         WHERE m.pool_id = ?
         ORDER BY m.created_at ASC`,
        [poolId]
    );

    return rows;
};