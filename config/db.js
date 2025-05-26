const mongoose = require("mongoose");

const connectMongo = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("[DEBUG] Database connected!");
    } catch (error) {
        console.log(error);
    }
}

module.exports = connectMongo;