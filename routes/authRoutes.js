const express = require("express");
const jwt = require('jsonwebtoken');
const router = express.Router();

const { signup, login } = require("../controllers/authController.js");

router.post("/signup", signup);
router.post("/login", login);

module.exports = router;