
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const createAdmin = async () => {
  try {
    if (
      !process.env.MONGO_URI ||
      !process.env.ADMIN_EMAIL ||
      !process.env.ADMIN_PASSWORD
    ) {
      throw new Error("Required environment variables are missing");
    }

    const adminEmail = process.env.ADMIN_EMAIL.toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminPassword.length < 8) {
      throw new Error("Admin password must be at least 8 characters");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const existingAdmin = await User.findOne({
      email: adminEmail
    });

    if (existingAdmin) {
      existingAdmin.role = "admin";
      existingAdmin.password = hashedPassword;

      await existingAdmin.save();

      console.log("Existing account updated as Admin.");
      console.log("Admin password updated successfully.");
    } else {
      await User.create({
        name: "GoX Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin"
      });

      console.log("Admin account created successfully.");
    }

  } catch (error) {
    console.error("Admin setup error:", error.message);

  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

createAdmin();
