const express = require("express");
const router = express.Router();

/*
router.get("/login", (req, res) => {
    res.send("Login route");
});
*/

const { login } = require("../controllers/userController");
//router.get("/login", login);

const { getAllUsers } = require("../controllers/userController");
router.get("/all", getAllUsers);

module.exports = router;