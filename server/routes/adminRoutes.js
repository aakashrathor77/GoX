
const express = require("express");
const User = require("../models/User");
const Order = require("../models/Order");
const Ride = require("../models/Ride");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes below require Admin login
router.use(verifyToken, verifyAdmin);

// Dashboard Statistics + Revenue Analytics
router.get("/stats", async (req, res) => {
  try {
    const [
      totalUsers,
      totalOrders,
      totalRides,
      foodRevenueData,
      rideRevenueData
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Order.countDocuments(),
      Ride.countDocuments(),

      Order.aggregate([
        { $match: { status: "Delivered" } },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" }
          }
        }
      ]),

      Ride.aggregate([
        { $match: { status: "Completed" } },
        {
          $group: {
            _id: null,
            total: { $sum: "$fare" }
          }
        }
      ])
    ]);

    const totalFoodRevenue = foodRevenueData[0]?.total || 0;
    const totalRideRevenue = rideRevenueData[0]?.total || 0;

    // Last 6 months
    const now = new Date();
    const startDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1)
    );

    const [monthlyOrders, monthlyRides] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            orders: { $sum: 1 },
            foodRevenue: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "Delivered"] },
                  "$totalAmount",
                  0
                ]
              }
            }
          }
        }
      ]),

      Ride.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            rides: { $sum: 1 },
            rideRevenue: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "Completed"] },
                  "$fare",
                  0
                ]
              }
            }
          }
        }
      ])
    ]);

    const monthlyData = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1)
      );

      const year = date.getUTCFullYear();
      const month = date.getUTCMonth() + 1;

      const orderData = monthlyOrders.find(
        (item) =>
          item._id.year === year &&
          item._id.month === month
      );

      const rideData = monthlyRides.find(
        (item) =>
          item._id.year === year &&
          item._id.month === month
      );

      monthlyData.push({
        month: date.toLocaleString("en-US", {
          month: "short",
          timeZone: "UTC"
        }),
        orders: orderData?.orders || 0,
        rides: rideData?.rides || 0,
        foodRevenue: orderData?.foodRevenue || 0,
        rideRevenue: rideData?.rideRevenue || 0
      });
    }

    res.json({
      totalUsers,
      totalOrders,
      totalRides,
      totalFoodRevenue,
      totalRideRevenue,
      totalRevenue: totalFoodRevenue + totalRideRevenue,
      monthlyData
    });

  } catch (error) {
    console.error("Dashboard statistics error:", error);
    res.status(500).json({
      message: "Unable to fetch dashboard statistics."
    });
  }
});

// Get All Users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("-password -resetOTP -resetOTPExpiry")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch users." });
  }
});

// Get All Food Orders
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch orders." });
  }
});

// Update Food Order Status
router.patch("/orders/:id/status", async (req, res) => {
  try {
    const allowedStatuses = [
      "Placed",
      "Preparing",
      "Out for Delivery",
      "Delivered",
      "Cancelled"
    ];

    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status." });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: "after", runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.json({
      message: "Order status updated successfully.",
      order
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to update order status." });
  }
});

// Get All Rides
router.get("/rides", async (req, res) => {
  try {
    const rides = await Ride.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch rides." });
  }
});

// Update Ride Status
router.patch("/rides/:id/status", async (req, res) => {
  try {
    const allowedStatuses = [
      "Booked",
      "Accepted",
      "Ongoing",
      "Completed",
      "Cancelled"
    ];

    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid ride status." });
    }

    const ride = await Ride.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: "after", runValidators: true }
    );

    if (!ride) {
      return res.status(404).json({ message: "Ride not found." });
    }

    res.json({
      message: "Ride status updated successfully.",
      ride
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to update ride status." });
  }
});

module.exports = router;
