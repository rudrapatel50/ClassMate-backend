const validateSignup = (req, res, next) => {
    const { email, password, username, firstName, lastName } = req.body;

    if (!email || !password || !username || !firstName || !lastName) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Username validation
    if (username.length < 3 || username.length > 20) {
        return res.status(400).json({ error: 'Username must be 3-20 characters long' });
    }
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
        return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
    }

    // First name and last name validation
    const nameRegex = /^[A-Za-z]{2,30}$/;
    if (!nameRegex.test(firstName)) {
        return res.status(400).json({ error: 'First name must be 2-30 letters' });
    }
    if (!nameRegex.test(lastName)) {
        return res.status(400).json({ error: 'Last name must be 2-30 letters' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    // Password validation
    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ 
            error: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character' 
        });
    }

    next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    next();
};

const validatePasswordReset = (req, res, next) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ error: 'New password is required' });
    }

    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ 
            error: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character' 
        });
    }

    next();
};

module.exports = {
    validateSignup,
    validateLogin,
    validatePasswordReset
}; 