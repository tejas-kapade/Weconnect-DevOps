const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { createUser, getUserByEmail } = require("../services/authService");
const { getUserByUsername } = require("../services/authService");

const JWT_SECRET = "mysecretkey"; // later move to .env

// REGISTER
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: "All fields required" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        await createUser(username, email, hashedPassword);

        res.json({ message: "User registered successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        //const user = await getUserByEmail(email);
        const user = await getUserByUsername(username);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid password" });
        }

        // generate token
        /*
        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: "1h" }
        );*/
        //Added admin role to token for future use in authorization
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role || "user" },
            process.env.JWT_SECRET || "Metacore@989/"
        );

        res.json({ token });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};