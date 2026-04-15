const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "Metacore@989/"; 

module.exports = (req, res, next) => {
    console.log("USER ROLE:", req.user.role);
    
    if (req.user.role !== "admin") {
        //console.log("Admin access denied");
        return res.status(403).json({ error: "Admin only" });
    }
    next();
};