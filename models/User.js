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
}, { 
    timestamps: true 
});

const User = mongoose.model("User", userSchema);
module.exports = User;