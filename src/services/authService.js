const db = require("../config/db");

exports.createUser = async (username, email, password) => {
    const [result] = await db.query(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        [username, email, password]
    );
    return result;
};

/*
Login using Email
exports.getUserByEmail = async (email) => {
    const [rows] = await db.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );
    return rows[0];
};
*/

//Login using Username
exports.getUserByUsername = async (username) => {
    const [rows] = await db.query(
        "SELECT * FROM users WHERE username = ?",
        [username]
    );
    return rows[0];
};