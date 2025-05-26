const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    role: { 
        type: String,
        default: "student",
    },
}, { timestamps: true } );

const User = mongoose.model("User", userSchema);
module.exports = User;
