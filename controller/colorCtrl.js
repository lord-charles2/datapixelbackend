const Product = require("../models/products");
const asyncHandler = require("express-async-handler");
const Color = require("../models/colorModel");

const createColor = asyncHandler(async (req, res) => {
  const { name, code, image, availability, productId } = req.body;

  // Find or create the Color object
  let color = await Color.findOne({ name, code });

  if (!color) {
    color = await Color.create({ name, code, image, availability });
  } else {
    res.status(409).json({
      message:
        "Color already exists, but am pushing provided color to your product",
    });
  }

  // Update the product with the new color and availability
  const product = await Product.findByIdAndUpdate(
    productId,
    {
      $push: {
        colors: color._id,
      },
    },
    {
      new: true,
    }
  );

  // If the product does not exist, return an error
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Return a success message and the new color and availability
  res.status(201).json({
    message: "Color added to product",
    color,
  });
});

// Update a color for a specific product
const updateColor = asyncHandler(async (req, res) => {
  // Get the color and availability from the request body

  // Update the product with the new availability for the specified color
  const updatedColor = await Color.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
    },
    {
      new: true,
    }
  );

  // If the specified color does not exist for the updatedColor, return an error
  if (!updatedColor) {
    return res.status(404).json({ message: "updatedColor not found" });
  }

  // Return a success message and the updated color and availability
  res.json({
    message: "Success",
    updatedColor,
  });
});

// Delete a color for a specific product
const deleteColor = asyncHandler(async (req, res) => {
  const colorId = req.params.id;
  const product = await Product.findOne({ color: colorId });

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Remove the color from the product's color array
  product.colors.pull(colorId);
  await product.save();

  // Delete the color itself
  await Color.findByIdAndDelete(colorId);

  res.json({ message: "color deleted successfully" });
});

// Get all products colors
const getColors = asyncHandler(async (req, res) => {
  // Find all brands for the specified product
  const color = await Color.find().select("-__v");
  if (!color) {
    return res.status(404).json({ message: "no colors founds" });
  }
  // Return the list of color
  res.status(200).json({ color, message: "success" });
});

// Get a single product by ID
const getSingleColor = asyncHandler(async (req, res) => {
  const color = await Color.findById(req.params.id).select("-__v");
  if (!color) {
    res.status(404).json({ message: "color not found" });
  }
  res.status(200).json({ color, message: "success" });
});

module.exports = {
  createColor,
  getColors,
  getSingleColor,
  updateColor,
  deleteColor,
};
