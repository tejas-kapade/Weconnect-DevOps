const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const { runQuery } = require("../controllers/adminController");

router.post("/query", authMiddleware, adminOnly, runQuery);

module.exports = router;
