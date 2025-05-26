const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    role: { 
        type: String,
        default: "student",
        enum: ["student", "admin"]
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date,
    active: {
        type: Boolean,
        default: true
    }
}, { 
    timestamps: true 
});

// Add index for email verification token
userSchema.index({ emailVerificationToken: 1 }, { sparse: true });

// Add index for password reset token
userSchema.index({ passwordResetToken: 1 }, { sparse: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
