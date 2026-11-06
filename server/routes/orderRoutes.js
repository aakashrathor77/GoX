
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Order = require("../models/Order");
const Notification = require("../models/Notification");

const router = express.Router();

const foodPrices = {
  "Cheese Pizza": 199,
  "Classic Burger": 99,
  "Delicious Pasta": 149,
  "Fresh Salad": 129,
  "Tasty Sandwich": 119,
  "Delicious Biryani": 179,
  "Veg Momos": 89,
  "French Fries": 79,
  "Masala Dosa": 119,
  "Chow Mein": 129,
  "Paneer Tikka": 189,
  "Chocolate Cake": 149,
  "Ice Cream": 69,
  "Veg Thali": 159,
  "Veg Spring Roll": 109
};

const coupons = {
  WELCOME10: {
    discount: 10,
    minOrder: 199,
    maxDiscount: 100
  },
  GOX20: {
    discount: 20,
    minOrder: 399,
    maxDiscount: 150
  }
};

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Please login first"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id || decoded.userId;

    if (!req.userId || !mongoose.isValidObjectId(req.userId)) {
      return res.status(401).json({
        message: "Invalid user account"
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

const createNotification = async (user, title, message, type) => {
  try {
    await Notification.create({
      user,
      title,
      message,
      type
    });
  } catch (error) {
    console.error("Notification Error:", error.message);
  }
};

const calculateSubtotal = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Your cart is empty");
  }

  const safeItems = items.map((item) => {
    const price = foodPrices[item.name];

    if (
      !price ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 20
    ) {
      throw new Error("Invalid food item or quantity");
    }

    return {
      name: item.name,
      price,
      quantity: item.quantity
    };
  });

  const subtotal = safeItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return { safeItems, subtotal };
};

const calculateDiscount = (couponCode, subtotal) => {
  if (!couponCode) {
    return {
      couponCode: null,
      discountAmount: 0
    };
  }

  const normalizedCode = couponCode.trim().toUpperCase();
  const coupon = coupons[normalizedCode];

  if (!coupon) {
    throw new Error("Invalid coupon code");
  }

  if (subtotal < coupon.minOrder) {
    throw new Error(
      `Minimum order of ₹${coupon.minOrder} required for this coupon`
    );
  }

  const discountAmount = Math.min(
    Math.round(subtotal * coupon.discount / 100),
    coupon.maxDiscount
  );

  return {
    couponCode: normalizedCode,
    discountAmount
  };
};

// Validate Coupon
router.post("/validate-coupon", verifyToken, (req, res) => {
  try {
    const { items, couponCode } = req.body;
    const { subtotal } = calculateSubtotal(items);
    const result = calculateDiscount(couponCode, subtotal);

    res.status(200).json({
      message: "Coupon applied successfully",
      couponCode: result.couponCode,
      subtotal,
      discountAmount: result.discountAmount,
      totalAmount: subtotal - result.discountAmount
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Place New Order
router.post("/", verifyToken, async (req, res) => {
  try {
    const { customer, items, couponCode } = req.body;

    if (
      !customer?.name?.trim() ||
      !/^[0-9]{10}$/.test(customer.phone || "") ||
      !customer?.address?.trim()
    ) {
      return res.status(400).json({
        message: "Please enter valid customer details"
      });
    }

    const { safeItems, subtotal } = calculateSubtotal(items);
    const couponResult = calculateDiscount(couponCode, subtotal);
    const totalAmount = subtotal - couponResult.discountAmount;

    const order = await Order.create({
      user: req.userId,
      customer,
      items: safeItems,
      subtotal,
      couponCode: couponResult.couponCode,
      discountAmount: couponResult.discountAmount,
      totalAmount
    });

    await createNotification(
      req.userId,
      "Order Placed Successfully!",
      `Your food order has been placed. Total amount: ₹${totalAmount}.`,
      "order"
    );

    res.status(201).json({
      message: "Order placed successfully",
      order
    });
  } catch (error) {
    console.error("Place Order Error:", error);

    res.status(400).json({
      message: error.message || "Unable to place order"
    });
  }
});

// Get Logged-in User's Orders
router.get("/my", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.userId
    }).sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Fetch Orders Error:", error);

    res.status(500).json({
      message: "Unable to fetch orders",
      error: error.message
    });
  }
});

// Cancel Order
router.patch("/:id/cancel", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid order ID"
      });
    }

    const order = await Order.findOne({
      _id: id,
      user: req.userId
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    if (order.status !== "Placed") {
      return res.status(400).json({
        message: "This order cannot be cancelled"
      });
    }

    order.status = "Cancelled";
    await order.save();

    await createNotification(
      req.userId,
      "Order Cancelled",
      "Your food order has been cancelled successfully.",
      "order"
    );

    res.status(200).json({
      message: "Order cancelled successfully",
      order
    });
  } catch (error) {
    console.error("Cancel Order Error:", error);

    res.status(500).json({
      message: "Unable to cancel order",
      error: error.message
    });
  }
});

// Submit Order Rating and Review
router.patch("/:id/review", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid order ID"
      });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Please select a rating between 1 and 5"
      });
    }

    if (typeof review !== "string" || review.trim().length < 3) {
      return res.status(400).json({
        message: "Please write at least 3 characters"
      });
    }

    const order = await Order.findOne({
      _id: id,
      user: req.userId
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    if (order.status !== "Delivered") {
      return res.status(400).json({
        message: "You can review only delivered orders"
      });
    }

    if (order.rating !== null && order.rating !== undefined) {
      return res.status(400).json({
        message: "You have already reviewed this order"
      });
    }

    order.rating = rating;
    order.review = review.trim();
    order.reviewedAt = new Date();

    await order.save();

    res.status(200).json({
      message: "Thank you for your review!",
      order
    });
  } catch (error) {
    console.error("Review Error:", error);

    res.status(500).json({
      message: "Unable to submit review"
    });
  }
});

module.exports = router;
