const db = require("../config/db");

exports.getUsers = async () => {
    const [rows] = await db.query("SELECT * FROM users");
    return rows;
};