
const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    pickup: {
      type: String,
      required: true,
      trim: true
    },

    destination: {
      type: String,
      required: true,
      trim: true
    },

    rideType: {
      type: String,
      enum: ["Bike", "Auto", "Car"],
      required: true
    },

    estimatedDistance: {
      type: Number,
      required: true
    },

    fare: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ["Booked", "Accepted", "Ongoing", "Completed", "Cancelled"],
      default: "Booked"
    }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Ride || mongoose.model("Ride", rideSchema);
