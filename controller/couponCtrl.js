const Coupon = require("../models/couponModel");
const validateMongoDbId = require("../utils/validateMongodbId");

const asyncHandler = require("express-async-handler");

const createCoupon = asyncHandler(async (req, res) => {
  const { name, expiry, discount } = req.body;
  const existingCoupon = await Coupon.findOne({ name }); // check if coupon with given name already exists
  if (existingCoupon) {
    res.status(400).send("Coupon with the same name already exists.");
  } else {
    const coupon = await Coupon.create({ name, expiry, discount }); // create a new coupon
    res.status(200).json({ coupon, message: "coupon added successfully" });
  }
});

const getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (error) {
    next(error);
  }
};

const updateCoupon = async (req, res, next) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatecoupon = await Coupon.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatecoupon);
  } catch (error) {
    next(error);
  }
};

const deleteCoupon = async (req, res, next) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletecoupon = await Coupon.findByIdAndDelete(id);
    res.json(deletecoupon);
  } catch (error) {
    next(error);
  }
};

const getCoupon = async (req, res, next) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getAcoupon = await Coupon.findById(id);
    res.json(getAcoupon);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  getCoupon,
};
