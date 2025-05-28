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

router.get("/me", auth, async (req, res) => {
  try {
    // Remove sensitive fields if needed
    const { password, ...userWithoutPassword } = req.user.toObject();
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;