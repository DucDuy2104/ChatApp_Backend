const express = require("express");
const router = express.Router();
const controller = require("../controllers/UserController");

//Register
router.post("/register", controller.register);

//Login
router.post("/login", controller.login);

module.exports = router;
