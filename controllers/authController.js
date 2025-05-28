const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require('jsonwebtoken');

const signup = async (req, res) => {
    try {
        const existingUser = await User.findOne({ $or: [ { email: req.body.email }, { username: req.body.username } ] });
        if (existingUser) {
            return res.status(409).json({ message: "Email or username already exists" });
        }

        const hash = await bcrypt.hash(req.body.password, 10);
        const user = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: hash,
            firstName: req.body.firstName,
            lastName: req.body.lastName
        });

        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET_KEY, 
            { expiresIn: '1h' }
        );

        return res.status(201).json({ 
            message: "User created successfully!",
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const login = async(req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: "Authentication failed" });
        }

        const matchPassword = await bcrypt.compare(password, user.password);
        if (!matchPassword) {
            return res.status(401).json({ error: 'Authentication failed' });
        }

        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET_KEY, 
            { expiresIn: '1h' }
        );

        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        return res.status(200).json({ 
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            } 
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const logout = async (req, res) => {
    try {
        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = { 
    signup, 
    login, 
    logout 
};