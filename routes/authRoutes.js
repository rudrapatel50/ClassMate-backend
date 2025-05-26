const express = require("express");
const router = express.Router();
const { 
    signup, 
    login, 
    verifyEmail, 
    requestPasswordReset, 
    resetPassword, 
    logout 
} = require("../controllers/authController.js");
const { 
    validateSignup, 
    validateLogin, 
    validatePasswordReset 
} = require("../middleware/validate.js");
const auth = require("../middleware/auth.js");

// Public routes
router.post("/signup", validateSignup, signup);
router.post("/login", validateLogin, login);
router.get("/verify-email/:token", verifyEmail);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password/:token", validatePasswordReset, resetPassword);

// Protected routes
router.post("/logout", auth, logout);

module.exports = router;