const mongoose = require("mongoose");

const categorySchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    title2: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

exports.Category = mongoose.model("Category", categorySchema);
