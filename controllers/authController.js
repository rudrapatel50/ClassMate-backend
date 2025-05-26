const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require('jsonwebtoken');

const signup = async (req, res) => {
    try {
        console.log("DEBUG: Signup request body:", req.body);
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already exists" });
        } else {
            const hash = await bcrypt.hash(req.body.password, 10)
            const user = await User.create({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: hash,
            });
            return res.status(201).json({ message: "User Created!" });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const login = async(req, res) => {
    try {
        console.log("DEBUG: Login request body:", req.body);
        const email = req.body.email;
        const password = req.body.password;

        const user = await User.findOne({email});

        if(!user) {
            return res.status(401).json({ error: "Authentication failed" });
        }

        const matchPassword = await bcrypt.compare(password, user.password);
        if(!matchPassword) {
            return res.status(401).json({ error: 'Authentication failed' });
        }

        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET_KEY, { expiresIn: '1h'} );
        return res.status(200).json({ 
            token: token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            } 
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

module.exports = { signup, login };