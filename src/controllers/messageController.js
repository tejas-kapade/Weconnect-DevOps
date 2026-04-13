const db = require("../config/db");
const { sendMessage, getMessages } = require("../services/messageService");

exports.sendMessage = async (req, res) => {
    try {
        const { poolId, message } = req.body;
        const senderId = req.user.id;

        if (!poolId || !message) {
            return res.status(400).json({ error: "poolId and message required" });
        }

        await sendMessage(poolId, senderId, message);

        res.json({ message: "Message sent" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const poolId = req.params.poolId;

        const [rows] = await db.query(`
            SELECT 
                m.message,
                m.created_at AS time,
                u.username
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.pool_id = ?
            ORDER BY m.created_at ASC
        `, [poolId]);
        

        /*
        OLD LOGIC FOR MESSAGE QUERY
        const [rows] = await db.query(`
            SELECT 
                m.message,
                DATE_FORMAT(m.created_at, '%Y-%m-%d %H:%i:%s') AS time,
                u.username
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.pool_id = ?
            ORDER BY m.created_at ASC
        `, [poolId]);
        */

        res.json(rows);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};