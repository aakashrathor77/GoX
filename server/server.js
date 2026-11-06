
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const rideRoutes = require("./routes/rideRoutes");
const adminRoutes = require("./routes/adminRoutes");
const profileRoutes = require("./routes/profileRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/notifications", notificationRoutes);

// Backend Test Route
app.get("/", (req, res) => {
  res.status(200).send("GoX Backend Server is Running!");
});

// MongoDB Connection Monitoring
mongoose.connection.on("connected", () => {
  console.log("MongoDB Connection Established!");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB Connection Error:", error);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB Disconnected!");
});

// Start Server
const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from the .env file.");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10
    });

    console.log("MongoDB Connected Successfully!");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`GoX Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("MongoDB Connection Failed:", error);
    process.exit(1);
  }
};

// Graceful Shutdown
const shutdown = async () => {
  console.log("Shutting down GoX Server...");

  try {
    await mongoose.connection.close();
    console.log("MongoDB Connection Closed.");
  } catch (error) {
    console.error("Shutdown Error:", error.message);
  }

  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Start Application
startServer();
