const jwt = require("jsonwebtoken");

const JWT_SECRET = "mysecretkey"; // move to .env later

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: "No token provided" });
        }

        // format: Bearer TOKEN
        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = decoded; // 👈 IMPORTANT

        next();

    } catch (err) {
        return res.status(401).json({ error: "Invalid token" });
    }
};