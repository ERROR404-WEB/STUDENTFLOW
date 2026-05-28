const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

const createAdmin = async () => {
    await mongoose.connect(process.env.MONGO_URI);

    const email = "admin@studentflow.com";

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
        console.log("Admin already exists");
        process.exit();
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
        name: "Admin",
        email: email,
        password: hashedPassword,
        role: "ADMIN"
    });

    console.log("Admin created");
    process.exit();
};

createAdmin();