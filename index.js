require("dotenv").config();
const express = require("express");
const connectMongo = require("./config/db.js");
const authRoutes = require("./routes/authRoutes.js");

const app = express();

app.use(express.json());

app.use("/api/v1/auth", authRoutes); //auth routes

//setup server
PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
    connectMongo();
});