require("dotenv").config();
const express = require("express");
const connectMongo = require("./config/db.js");
const authRoutes = require("./routes/authRoutes.js");
const cors = require('cors');
const helmet = require('helmet');
const { authLimiter, apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/v1/auth', authLimiter);
app.use('/api/v1', apiLimiter);

// Routes
app.use("/api/v1/auth", authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Setup server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    connectMongo();
});