
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Ride = require("../models/Ride");
const Notification = require("../models/Notification");

const router = express.Router();

// Ride Pricing (per km)
const ridePrices = {
  Bike: 10,
  Auto: 15,
  Car: 20
};

// Create Notification
const createNotification = async (user, title, message, type) => {
  try {
    await Notification.create({
      user,
      title,
      message,
      type
    });
  } catch (error) {
    console.error("Ride Notification Error:", error.message);
  }
};

// Verify Login Token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Please login to continue."
    });
  }

  try {
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId || decoded.id;

    if (!req.userId) {
      return res.status(401).json({
        message: "Invalid user token."
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token."
    });
  }
};

// Create New Ride
router.post("/", verifyToken, async (req, res) => {
  try {
    const { pickup, destination, rideType } = req.body;

    // Validate Required Fields
    if (
      typeof pickup !== "string" ||
      typeof destination !== "string" ||
      !pickup.trim() ||
      !destination.trim() ||
      !rideType
    ) {
      return res.status(400).json({
        message: "Please provide valid pickup and destination details."
      });
    }

    // Validate Pickup and Destination
    if (
      pickup.trim().toLowerCase() ===
      destination.trim().toLowerCase()
    ) {
      return res.status(400).json({
        message: "Pickup and destination cannot be the same."
      });
    }

    // Validate Ride Type
    if (!Object.prototype.hasOwnProperty.call(ridePrices, rideType)) {
      return res.status(400).json({
        message: "Invalid ride type."
      });
    }

    // Temporary Demo Distance
    const estimatedDistance = 8;

    // Calculate Fare on Server
    const fare = estimatedDistance * ridePrices[rideType];

    // Validate User ID
    if (!mongoose.Types.ObjectId.isValid(req.userId)) {
      return res.status(401).json({
        message: "Invalid user account."
      });
    }

    // Save Ride in MongoDB
    const ride = await Ride.create({
      user: req.userId,
      pickup: pickup.trim(),
      destination: destination.trim(),
      rideType,
      estimatedDistance,
      fare
    });

    // Create Ride Booking Notification
    await createNotification(
      req.userId,
      "Ride Booked Successfully!",
      `Your ${rideType} ride from ${pickup.trim()} to ${destination.trim()} has been booked. Estimated fare: ₹${fare}.`,
      "ride"
    );

    return res.status(201).json({
      message: "Ride booked successfully!",
      ride
    });

  } catch (error) {
    console.error("Ride Booking Error:", error.message);

    return res.status(500).json({
      message: "Unable to book ride. Please try again."
    });
  }
});

// Get Logged-in User's Rides
router.get("/my", verifyToken, async (req, res) => {
  try {
    const rides = await Ride.find({
      user: req.userId
    }).sort({ createdAt: -1 });

    return res.status(200).json(rides);

  } catch (error) {
    console.error("Fetch Rides Error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch rides."
    });
  }
});

module.exports = router;
