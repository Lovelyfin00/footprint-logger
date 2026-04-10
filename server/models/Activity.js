const mongoose = require('mongoose');

const CATEGORIES = ["transport", "food", "energy"];

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    label: {
      type: String,
      required: [true, "Activity label is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: [true, "Category is required"],
    },
    co2kg: {
      type: Number,
      required: [true, "CO₂ value is required"],
      min: [0, "CO₂ cannot be negative"],
    },
    note: {
      type: String,
      trim: true,
      maxlength: [200, "Note must be under 200 characters"],
    },
    loggedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);

