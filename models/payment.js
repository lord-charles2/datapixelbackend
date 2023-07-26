// models/payment.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  id: String,
  invoice: {
    invoice_id: String,
    state: String,
    provider: String,
    charges: String,
    net_amount: Number,
    currency: String,
    value: String,
    account: String,
    api_ref: String,
    mpesa_reference: String,
    host: String,
    retry_count: Number,
    failed_reason: String,
    failed_code: String,
    failed_code_link: String,
    created_at: Date,
    updated_at: Date,
  },
  customer: {
    customer_id: String,
    phone_number: String,
    email: String,
    first_name: String,
    last_name: String,
    country: String,
    zipcode: String,
    provider: String,
    created_at: Date,
    updated_at: Date,
  },
  payment_link: String,
  customer_comment: String,
  refundable: Boolean,
  created_at: Date,
  updated_at: Date,
});

module.exports = mongoose.model("Payment", paymentSchema);
