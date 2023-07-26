const FlashSaleProduct = require("../models/flashSaleModel");
const Product = require("../models/products");
const moment = require("moment-timezone");
const validateMongodbId = require("../utils/validateMongodbId");
const Order = require("../models/orderModel");
const expressAsyncHandler = require("express-async-handler");

//Add flashproduct
const AddFlashSale = async (req, res) => {
  const { productId, discountPercentage, quantity, startTime, endTime } =
    req.body;

  validateMongodbId(productId);

  // Get the current time in Nairobi
  const currentTime = moment().tz("Africa/Nairobi");
  console.log(currentTime);
  // Convert the start time from UTC to Nairobi time
  const startDateTime = moment
    .utc(startTime)
    .tz("Africa/Nairobi")
    .subtract(3, "hours");

  console.log(startDateTime);

  // Check if product ID exists
  const product = await Product.findById(productId);
  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }

  // Check if start time is in the future
  if (startDateTime.isBefore(currentTime)) {
    return res
      .status(400)
      .json({ success: false, message: "Start time must be in the future" });
  }

  // Check if end time is after start time
  const endDateTime = moment
    .utc(endTime)
    .tz("Africa/Nairobi")
    .subtract(3, "hours");

  if (endDateTime.isSameOrBefore(startDateTime)) {
    return res
      .status(400)
      .json({ success: false, message: "End time must be after start time" });
  }

  try {
    // Check if product is already in flash sale
    const existingFlashSale = await FlashSaleProduct.findOne({ productId });
    if (existingFlashSale) {
      return res
        .status(400)
        .json({ success: false, message: "Product is already in flash sale" });
    }
    const flashSaleProduct = await FlashSaleProduct.create({
      productId,
      discountPercentage,
      quantity,
      startTime,
      endTime,
    });

    res.status(200).json({ success: true, flashSaleProduct });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//remove flashSaleProduct automatically
const removeExpiredFlashSaleProducts = async (req, res) => {
  // Get current time in Nairobi
  const currentTime = new Date();
  currentTime.setHours(currentTime.getHours() + 3);
  const isoString = currentTime.toISOString();
  await FlashSaleProduct.deleteMany({ endTime: { $lte: isoString } });
  res.status(200).json({ success: true });
};

// Get all flash sale products
const getAllFlashSaleProducts = async (req, res) => {
  try {
    const flashSaleProducts = await FlashSaleProduct.find().populate(
      "productId"
    );
    res.status(200).json({ success: true, flashSaleProducts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get flash sale product by ID
const getFlashSaleProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const flashSaleProduct = await FlashSaleProduct.findById(id).populate(
      "productId"
    );
    if (!flashSaleProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Flash sale product not found" });
    }
    res.status(200).json({ success: true, flashSaleProduct });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//  Get flash sale products that have not expired.

const getActiveFlashSaleProducts = async (req, res) => {
  try {
    // Get current time in Nairobi
    const currentTime = new Date();

    //ongoing
    const currentTime1 = new Date();
    const currentTime2 = new Date();
    currentTime1.setHours(currentTime.getHours() + 3 + 2);
    // console.log(currentTime1);
    const isoString = currentTime1.toISOString();
    currentTime2.setHours(currentTime.getHours() + 3 - 2);
    // console.log(currentTime2);

    //upcoming after 2hours
    const currentTime3 = new Date();
    const currentTime4 = new Date();
    currentTime3.setHours(currentTime.getHours() + 3);
    // console.log(currentTime3);
    currentTime4.setHours(currentTime.getHours() + 3 + 4);
    // console.log(currentTime4);
    const isoString1 = currentTime4.toISOString();

    //upcoming after 4hours
    const currentTime5 = new Date();
    const currentTime6 = new Date();
    currentTime5.setHours(currentTime.getHours() + 3 + 2);
    // console.log(currentTime5);
    currentTime6.setHours(currentTime.getHours() + 3 + 6);
    // console.log(currentTime6);
    const isoString2 = currentTime6.toISOString();

    //upcoming after 6hours
    const currentTime7 = new Date();
    const currentTime8 = new Date();
    currentTime7.setHours(currentTime.getHours() + 3 + 4);
    // console.log(currentTime7);
    currentTime8.setHours(currentTime.getHours() + 3 + 8);
    // console.log(currentTime8);
    const isoString3 = currentTime8.toISOString();

    // Find ongoing flash sale products with end time less than or equal to current time + 2 hours
    const ongoingFlashSaleProducts = await FlashSaleProduct.find({
      $and: [
        { endTime: { $lte: isoString } },
        { startTime: { $gte: currentTime2 } },
      ],
    })
      .populate("productId")
      .select("-__v");

    // Find upcoming flash sale products with start time greater than current time + 2 hours
    const upcomingFlashSaleProducts2Hours = await FlashSaleProduct.find({
      $and: [
        { endTime: { $lte: isoString1 } },
        { startTime: { $gte: currentTime3 } },
      ],
    })
      .populate("productId")
      .select("-__v");

    // Find upcoming flash sale products with start time greater than current time + 4 hours
    const upcomingFlashSaleProducts4Hours = await FlashSaleProduct.find({
      $and: [
        { endTime: { $lte: isoString2 } },
        { startTime: { $gte: currentTime5 } },
      ],
    })
      .populate("productId")
      .select("-__v");

    // Find upcoming flash sale products with start time greater than current time + 6 hours
    const upcomingFlashSaleProducts6Hours = await FlashSaleProduct.find({
      $and: [
        { endTime: { $lte: isoString3 } },
        { startTime: { $gte: currentTime7 } },
      ],
    })
      .populate("productId")
      .select("-__v");

    res.status(200).json({
      ongoingFlashSaleProducts,
      upcomingFlashSaleProducts2Hours,
      upcomingFlashSaleProducts4Hours,
      upcomingFlashSaleProducts6Hours,
    });
  } catch (error) {
    res.status(500).json({ message: "internal error", error: error });
    // console.error(error);
  }
};

//  Get flash sale products that have not expired.

const getInActiveFlashSaleProducts = async (req, res) => {
  try {
    // Get current time in Nairobi
    const currentTime = new Date();
    currentTime.setHours(currentTime.getHours() + 3);
    const isoString = currentTime.toISOString();

    console.log(isoString);

    // Find flash sale products with end time greater than current time
    const flashSaleProducts = await FlashSaleProduct.find({
      endTime: { $lt: isoString },
    }).populate("productId");

    res.status(200).json(flashSaleProducts);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get active flash sale products.");
  }
};

// Update flash sale product by ID
const updateFlashSaleProduct = async (req, res) => {
  const { id } = req.params;
  const { discountPercentage, startTime, endTime, quantity } = req.body;
  // Get the current time in Nairobi
  const currentTime = moment().tz("Africa/Nairobi");
  console.log(currentTime);
  // Convert the start time from UTC to Nairobi time
  const startDateTime = moment
    .utc(startTime)
    .tz("Africa/Nairobi")
    .subtract(3, "hours");

  // Check if start time is in the future
  if (startDateTime.isBefore(currentTime)) {
    return res
      .status(400)
      .json({ success: false, message: "Start time must be in the future" });
  }

  // Check if end time is after start time
  const endDateTime = moment
    .utc(endTime)
    .tz("Africa/Nairobi")
    .subtract(3, "hours");

  if (endDateTime.isSameOrBefore(startDateTime)) {
    return res
      .status(400)
      .json({ success: false, message: "End time must be after start time" });
  }

  try {
    const flashSaleProduct = await FlashSaleProduct.findById(id);
    if (!flashSaleProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Flash sale product not found" });
    }
    flashSaleProduct.discountPercentage = discountPercentage;
    flashSaleProduct.startTime = startTime;
    flashSaleProduct.endTime = endTime;
    flashSaleProduct.quantity = quantity;
    await flashSaleProduct.save();
    res.status(200).json({ success: true, flashSaleProduct });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete flash sale product by ID
const deleteFlashSaleProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const flashSaleProduct = await FlashSaleProduct.findByIdAndDelete(id);
    if (!flashSaleProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Flash sale product not found" });
    }
    res.status(200).json({ success: true, flashSaleProduct });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get sales analytics
const getSalesAnalytics = async (req, res) => {
  try {
    // Get the date 7 days ago
    const sevenDaysAgo = moment().subtract(7, "days").toDate();

    // Get total sales and flash sale sales in the last 7 days
    const sales = await Order.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $lookup: {
          from: "flashsaleproducts",
          localField: "productId",
          foreignField: "productId",
          as: "flashSale",
        },
      },
      {
        $unwind: "$flashSale",
      },
      {
        $match: {
          $or: [
            {
              "flashSale.endTime": { $lte: new Date() },
              createdAt: {
                $gte: "$flashSale.startTime",
                $lte: "$flashSale.endTime",
              },
            },
            {
              createdAt: { $gte: sevenDaysAgo },
            },
          ],
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalPrice" },
          flashSaleSales: {
            $sum: {
              $cond: {
                if: { $lte: ["$flashSale.endTime", new Date()] },
                then: "$totalPrice",
                else: 0,
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalSales: 1,
          flashSaleSales: 1,
          totalFlashSales: { $literal: null },
        },
      },
    ]);

    // Get total number of flash sales in the last 7 days
    const totalFlashSales = await FlashSaleProduct.countDocuments({
      startTime: {
        $gte: sevenDaysAgo,
      },
    });

    const analytics = {
      totalSales: sales.length > 0 ? sales[0].totalSales : 0,
      flashSaleSales: sales.length > 0 ? sales[0].flashSaleSales : 0,
      totalFlashSales,
    };

    res.status(200).json({ success: true, analytics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  AddFlashSale,
  removeExpiredFlashSaleProducts,
  getAllFlashSaleProducts,
  getFlashSaleProductById,
  getActiveFlashSaleProducts,
  getInActiveFlashSaleProducts,
  updateFlashSaleProduct,
  deleteFlashSaleProduct,
  getSalesAnalytics,
};
