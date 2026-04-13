const db = require("../config/db");

/*
exports.getAllPools = async () => {
    const [rows] = await db.query("SELECT id, name, created_at FROM pools");
    return rows;
}*/

exports.createPool = async (name, password, userId) => {
    const [result] = await db.query(
        "INSERT INTO pools (name, password, created_by) VALUES (?, ?, ?)",
        [name, password, userId]
    );

    return result;
};

exports.getPoolById = async (poolId) => {
    const [rows] = await db.query(
        "SELECT * FROM pools WHERE id = ?",
        [poolId]
    );
    return rows[0];
};

exports.joinPool = async (userId, poolId) => {
    const [result] = await db.query(
        "INSERT INTO pool_members (user_id, pool_id) VALUES (?, ?)",
        [userId, poolId]
    );
    return result;
};

exports.isMember = async (userId, poolId) => {
    const [rows] = await db.query(
        "SELECT * FROM pool_members WHERE user_id = ? AND pool_id = ?",
        [userId, poolId]
    );
    return rows.length > 0;
};

