const express = require("express");
const router = express.Router();
const { 
    signup, 
    login, 
    logout 
} = require("../controllers/authController.js");
const { 
    validateSignup, 
    validateLogin
} = require("../middleware/validate.js");
const auth = require("../middleware/auth.js");

// Public routes
router.post("/signup", validateSignup, signup);
router.post("/login", validateLogin, login);

// Protected routes
router.post("/logout", auth, logout);

module.exports = router;