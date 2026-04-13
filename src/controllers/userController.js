const { getUsers } = require("../services/userService");

exports.getAllUsers = async (req, res) => {
    try {
        const users = await getUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};