const mongoose = require("mongoose");

// Define the WiFiVoucher schema
const WiFiVoucherSchema = new mongoose.Schema({
  speed: {
    type: String,
    required: true,
  },
  validity: {
    type: String,
    required: true,
  },
  bandwidth: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the WiFiVoucher model
const WiFiVoucher = mongoose.model("WiFiVoucher", WiFiVoucherSchema);

module.exports = WiFiVoucher;
