const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const { getPools } = require("../controllers/poolController");
const { createPool } = require("../controllers/poolController");
const { joinPool } = require("../controllers/poolController");
const { deletePool } = require("../controllers/poolController");
    
//router.get("/", getPools);
router.post("/join", authMiddleware, joinPool);
router.post("/create", authMiddleware, createPool);
router.get("/", authMiddleware, getPools);
router.delete("/:id", authMiddleware, deletePool);
router.get("/admin/all", authMiddleware, adminOnly, getPools);      
router.delete("/admin/:id", authMiddleware, adminOnly, deletePool);

module.exports = router;