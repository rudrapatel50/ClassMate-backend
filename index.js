require("dotenv").config();
const express = require("express");
const connectMongo = require("./config/db.js");
const authRoutes = require("./routes/authRoutes.js");
const projectRoutes = require("./routes/projectRoutes.js");
const taskRoutes = require("./routes/taskRoutes.js");
const cors = require('cors');
const helmet = require('helmet');
const { authLimiter, apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting only in production
if (process.env.NODE_ENV === 'production') {
    app.use('/api/v1/auth', authLimiter);
    app.use('/api/v1', apiLimiter);
}

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/tasks", taskRoutes);

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