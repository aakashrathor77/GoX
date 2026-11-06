const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    customer: {
      name: {
        type: String,
        required: true,
        trim: true
      },
      phone: {
        type: String,
        required: true
      },
      address: {
        type: String,
        required: true,
        trim: true
      }
    },

    items: [
      {
        name: {
          type: String,
          required: true
        },
        price: {
          type: Number,
          required: true,
          min: 0
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        }
      }
    ],

    subtotal: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    couponCode: {
      type: String,
      default: null
    },

    discountAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },

    review: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },

    reviewedAt: {
      type: Date,
      default: null
    },

    status: {
      type: String,
      enum: [
        "Placed",
        "Preparing",
        "Out for Delivery",
        "Delivered",
        "Cancelled"
      ],
      default: "Placed"
    }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Order || mongoose.model("Order", orderSchema);