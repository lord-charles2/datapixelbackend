// Require the necessary models
const Product = require("../models/products");
const Brand = require("../models/brandModel");
const asyncHandler = require("express-async-handler");

// Function to create a new brand for a product
const createBrand = asyncHandler(async (req, res) => {
  const { title, model, quantity, productId } = req.body;

  // Find or create the Color object
  let brand = await Brand.findOne({ model });

  if (!brand) {
    brand = await Brand.create({ title, model, quantity });
  } else {
    res.status(409).json({
      message:
        "brand model already exists, but am pushing brand provided to your product",
    });
  }

  // Update
  const product = await Product.findByIdAndUpdate(
    productId,
    {
      $push: {
        brand: brand._id,
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
    message: "brand added to product",
    brand,
  });
});

//get a brand by Id
const getBrand = asyncHandler(async (req, res) => {
  // Find the brand by ID
  const brand = await Brand.findById(req.params.id).select("-__v");
  // Return an error if the brand doesn't exist
  if (!brand) {
    return res.status(404).json({ message: "Brand not found" });
  }
  // Return the brand
  res.status(200).json({ brand, message: "success" });
});

// Function to get all brands for a product
const getAllBrands = asyncHandler(async (req, res) => {
  // Find all brands for the specified product
  const brands = await Brand.find().select("-__v");
  if (!brands) {
    return res.status(404).json({ message: "no brand founds" });
  }
  // Return the list of brands
  res.status(200).json({ brands, message: "success" });
});

// Function to update a brand by ID
const updateBrand = asyncHandler(async (req, res) => {
  // Find the brand by ID
  const brand = await Brand.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      quantity: req.body.quantity,
    },
    {
      new: true,
    }
  );
  // Return an error if the brand doesn't exist
  if (!brand) {
    return res.status(404).json({ message: "Brand not found" });
  }

  res.status(200).json({ message: "product updated", brand });
});

const deleteBrand = asyncHandler(async (req, res) => {
  const brandId = req.params.id;
  const product = await Product.findOne({ brand: brandId });

  if (!product) {
    return (
      res.status(404).json({ message: "Product not found" }),
      await Brand.findByIdAndDelete(brandId) // Delete the brand itself
    );
  }

  // Remove the brand from the product's brand array
  product.brand.pull(brandId);
  await product.save();

  // Delete the brand itself
  await Brand.findByIdAndDelete(brandId);

  res.json({ message: "Brand deleted successfully" });
});

module.exports = {
  createBrand,
  getBrand,
  getAllBrands,
  updateBrand,
  deleteBrand,
};
