require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");

const fixOldUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const result = await User.updateMany(
      {
        $or: [
          { role: { $exists: false } },
          { role: null }
        ]
      },
      {
        $set: { role: "user" }
      }
    );

    console.log("Old users updated:", result.modifiedCount);

    await mongoose.disconnect();
  } catch (error) {
    console.log("Error:", error.message);
    await mongoose.disconnect();
  }
};

fixOldUsers();