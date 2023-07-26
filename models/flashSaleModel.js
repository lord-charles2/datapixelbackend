const mongoose = require("mongoose");

const flashSaleSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  discountPercentage: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  startTime: {
    type: Date,
    required: true,
    min: Date.now(),
  },
  endTime: {
    type: Date,
    required: true,
    min: Date.now(),
    max: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // maximum 7 days from now
  },
});

const FlashSaleProduct = mongoose.model("FlashSaleProduct", flashSaleSchema);

module.exports = FlashSaleProduct;
