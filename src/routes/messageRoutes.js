const express = require("express");
const router = express.Router();

const { sendMessage, getMessages } = require("../controllers/messageController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/send", sendMessage);
//router.get("/:poolId", getMessages);
router.get("/:poolId", authMiddleware, getMessages);

module.exports = router;