//add to cart
const mongoose = require("mongoose");
const Product = require("../models/products");
const UserCart = require("../models/userCartModel");

//add to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity, color } = req.body;
    // Check if item already exists in cart
    const cartItem = await UserCart.findOne({
      userId: req.user.userId,
      "items.product": productId,
    }).lean();
    console.log(color);

    if (cartItem) {
      // If item exists, update quantity
      const product = await Product.findById(productId).lean();
      if (!product) {
        return res.status(400).json({ message: "Product not found" });
      }

      const requestedQuantity =
        cartItem.items.find((item) => item.product == productId).quantity +
        quantity;

      if (requestedQuantity > product.quantity) {
        return res
          .status(400)
          .json({ message: "Requested quantity not available" });
      }

      await UserCart.findOneAndUpdate(
        {
          userId: req.user.userId,
          "items.product": productId,
        },
        {
          $inc: { "items.$.quantity": quantity },
        }
      ).lean();
    } else {
      // If item does not exist, add new item to cart
      const product = await Product.findById(productId).lean();
      if (!product) {
        return res.status(400).json({ message: "Product not found" });
      }

      if (quantity > product.quantity) {
        return res
          .status(400)
          .json({ message: "Requested quantity not available" });
      }

      const newItem = {
        product: product._id,
        quantity: quantity,
        price: product.price,
        color: color,
      };

      await UserCart.findOneAndUpdate(
        { userId: req.user.userId },
        { $push: { items: newItem } },
        { upsert: true }
      ).lean();
    }

    return res.status(200).json({ message: "Item added to cart successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//get cart items
const getCartItems = async (req, res) => {
  try {
    const userCart = await UserCart.findOne({ userId: req.user.userId })
      .populate("items.product")
      .lean();

    if (!userCart) {
      return res.status(404).json({ message: "User cart not found" });
    }

    const items = userCart.items;
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = items.reduce(
      (acc, item) => acc + item.quantity * item.product.price,
      0
    );

    const response = {
      items,
      totalItems,
      totalPrice,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//update quantity
const updateCartItemQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const updatedCart = await UserCart.findOne({
      userId: req.user.userId,
      "items.product": productId,
    });

    if (quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    // Check if the item was found in the cart
    const updatedItem = updatedCart.items.find(
      (item) => item.product._id.toString() === productId.toString()
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    // Check if the product is in stock and available
    const objectIdString = updatedItem.product; // Assuming it contains the ObjectId value
    const objectId = String(objectIdString); // Ensure it's a string representation of ObjectId

    const inStock = await Product.findById(objectId).select("quantity").lean();
    // console.log(inStock.quantity);

    if (quantity > inStock.quantity) {
      return res.status(400).json({
        message: "Product is not available in required quantity",
      });
    }

    await UserCart.updateOne(
      { userId: req.user.userId, "items.product": productId },
      { $set: { "items.$.quantity": quantity } }
    );

    // Get the updated cart with total price and total items
    const updatedCartWithTotals = await UserCart.findOne({
      userId: req.user.userId,
    })
      .populate("items.product")
      .lean();

    // Calculate total items and total price
    const totalItems = updatedCartWithTotals.items.reduce(
      (acc, item) => acc + item.quantity,
      0
    );
    const totalPrice = updatedCartWithTotals.items.reduce(
      (acc, item) => acc + item.quantity * item.product.price,
      0
    );

    return res.status(200).json({
      message: "Cart item quantity updated successfully",
      cart: { items: updatedCartWithTotals.items, totalItems, totalPrice },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;

    await UserCart.updateOne(
      { userId: req.user.userId },
      { $pull: { items: { product: productId } } }
    );

    // Get the updated cart with total price and total items
    const updatedCartWithTotals = await UserCart.findOne({
      userId: req.user.userId,
    })
      .populate("items.product")
      .lean();

    // Calculate total items and total price
    const totalItems = updatedCartWithTotals.items.reduce(
      (acc, item) => acc + item.quantity,
      0
    );
    const totalPrice = updatedCartWithTotals.items.reduce(
      (acc, item) => acc + item.quantity * item.product.price,
      0
    );

    return res.status(200).json({
      message: "Item removed from cart successfully",
      cart: { items: updatedCartWithTotals.items, totalItems, totalPrice },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const clearCart = async (req, res) => {
  try {
    await UserCart.updateOne({ userId: req.user.userId }, { items: [] });

    return res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addToCart,
  getCartItems,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
};
