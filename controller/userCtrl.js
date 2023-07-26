const User = require("../models/userModel");
const Coupon = require("../models/couponModel");
const Cart = require("../models/cartModel");
const Product = require("../models/products");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validateMongodbId = require("../utils/validateMongodbId");
const sendEmail = require("./emailCtl");
const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const uniqid = require("uniqid");
const Order = require("../models/orderModel");
const UserCart = require("../models/userCartModel");
const { default: mongoose } = require("mongoose");

//Register AI CHECKED
const createUser = asyncHandler(async (req, res) => {
  const { firstname, lastname, email, mobile, password, isAdmin } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = new User({
    firstname,
    lastname,
    email,
    mobile,
    passwordHash: await bcrypt.hash(password, 10),
    isAdmin: isAdmin ?? false,
  });

  await user.save();

  res.status(200).json({ user, message: "User created" });
});

//login AI CHECKED
const logIn = asyncHandler(async (req, res) => {
  const secret = process.env.SECRET;
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });

  if (!user) {
    res.status(404).send("Wrong email!");
    return;
  }

  if (user && bcrypt.compareSync(password, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      secret,
      { expiresIn: "2000d" }
    );
    res.status(200).send({ user: user.email, token });
  } else {
    res.status(404).send("Wrong password!");
  }
});

//get users
const getUsers = asyncHandler(async (req, res) => {
  const { sort } = req.query;
  const sortOptions = {};

  if (
    sort &&
    [
      "firstname",
      "lastname",
      "email",
      "mobile",
      "dateJoined",
      "isAdmin",
      "isBlocked",
    ].includes(sort)
  ) {
    sortOptions[sort] = 1;
  } else {
    sortOptions["dateJoined"] = -1;
  }

  let users = await User.find({}, "-__v -passwordHash -wishlist -cart")
    .sort(sortOptions)
    .lean();

  if (sort === "isAdmin") {
    users = users.filter((user) => user[sort]); // filter based on sort field
  }

  if (sort === "isBlocked") {
    users = users.filter((user) => user[sort]); // filter based on sort field
  }
  res.status(200).json(users);
});

//get users by id
const getUserById = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  validateMongodbId(userId);
  const user = await User.findById(userId).select("-passwordHash");
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }
  res.status(200).json(user);
});

//get users by id
const getUserByEmail = asyncHandler(async (req, res) => {
  const { search } = req.query;

  if (!search) {
    return res.status(400).json({ message: "Search parameter is missing." });
  }

  const results = await User.find({
    email: { $regex: new RegExp(`^${search.toLowerCase()}`, "i") },
  }).select("email _id");

  if (results.length === 0) {
    return res.status(404).json({ message: "No results found." });
  }

  res.status(200).json(results);
});

//update user
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, email, mobile, password } = req.body;
  validateMongodbId(id);
  const updatedFields = {
    firstname,
    lastname,
    email,
    mobile,
    passwordHash: password ? await bcrypt.hash(password, 10) : undefined,
  };

  const user = await User.findByIdAndUpdate(id, updatedFields, { new: true });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }
  const cart = await Cart.findOne({ orderby: id }).populate("products.product");
  res.status(200).json(user, cart);
});

//delete users
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }
  res.status(200).send({ message: "user deleted!" });
});
//verify token
const verifyToken = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(404).send("There is no token attached to header");
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    const userId = decoded?.userId ?? null;
    if (!userId) {
      return res.status(404).send("Token does not contain user id");
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found for the given token");
    }
    res.status(200).json({ message: "authorized", user });
  } catch (error) {
    return res
      .status(404)
      .send("Not Authorized token expired, Please Login again");
  }
});

//get userCount
const getUserCount = asyncHandler(async (req, res) => {
  const usersCount = await User.countDocuments();
  res.status(200).send({ usersCount });
});

//block user
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      isBlocked: true,
    },
    { new: true }
  );
  if (!user) {
    res.status(404).send("user not found");
  } else {
    res.status(200).send(user);
  }
});

//unblock user
const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      isBlocked: false,
    },
    { new: true }
  );
  if (!user) {
    res.status(404).send("user not found");
  } else {
    res.status(200).send(user);
  }
});

//updatePassword
const updateUserDetails = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
    new: true,
  });
  res.json(updatedUser);
});

//forgotPassword
const forgotPassword = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404).json({ message: "User not found." });
  } else {
    const token = await user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    // const resetUrl = `${req.protocol}://${req.get(
    //   "host"
    // )}/users/resetPassword/${token}`;
    const data = {
      to: email,
      subject: "Password Reset Request",
      html: `
          <html>
            <head>
              <style>
                h1 {
                  font-size: 16px;
                  font-weight: 600;
                  margin: 0;
                  padding: 0;
                }
                h4 {
                  font-size: 14px;
                  font-weight: 400;
                  margin: 0;
                  padding: 0;
                }
                p {
                  font-size: 14px;
                  font-weight: 400;
                  margin: 0;
                  padding: 0;
                }
                a {
                  color: #0366d6;
                  text-decoration: none;
                }
              </style>
            </head>
            <body>
              <h1>Dear ${email},</h1>
              <p>
                We hope this email finds you well. Our records indicate that you recently requested a password reset. 
                To reset your password, please follow the Code below:
              </p>
             <h4><a href="">${token}</a></h4>
              <p>
                If you did not request this password reset, please ignore this email and your password will remain unchanged. 
                Your account security is our top priority, and we are committed to ensuring that all user information remains confidential.
              </p>
              <h4>
                If you have any questions or concerns, please do not hesitate to reach out to our support team. 
                They are available 24/7 and will be happy to assist you.
              </h4>
            </body>
          </html>
        `,
    };
    sendEmail(data);
    res.status(200).json({
      success: true,
      message: "Password reset email sent.",
      token: token,
    });
  }
});

//reset password
const resetPassword = asyncHandler(async (req, res) => {
  const token = req.params.token;
  const password = req.body.password;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetToken: { $gt: Date.now() },
  });
  if (!user) {
    res.status(404).json({ message: "token expired, please try again later" });
  } else {
    user.passwordHash = bcrypt.hashSync(password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.status(200).json({ message: "password updated successfully", user });
  }
});

//get wish list
const getWishlist = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const findUser = await User.findById(userId).populate("wishlist");
  res.json(findUser);
});

//applly coupon
const applyCoupon = async (req, res) => {
  const { coupon } = req.body;
  const { userId } = req.user;
  validateMongodbId(userId);
  const validCoupon = await Coupon.findOne({ name: coupon });
  if (!validCoupon) {
    return res.status(404).json({ message: "Coupon expired" });
  }
  //check if cart exist first
  const cart = await Cart.findOne({ orderby: userId });
  if (!cart) {
    return res.json({ message: "add products to cart first" });
  }

  const { cartTotal } = await Cart.findOne({ orderby: userId }).select(
    "cartTotal"
  );

  if (!cartTotal) {
    return res.json({ message: "add products to cart first" });
  }

  const totalAfterDiscount = (
    cartTotal -
    (cartTotal * validCoupon.discount) / 100
  ).toFixed(2);
  const updatedCart = await Cart.findOneAndUpdate(
    { orderby: userId },
    { totalAfterDiscount },
    { new: true }
  ).populate("products.product");
  res.json(updatedCart.totalAfterDiscount);
};

// Create the order and update product quantities
const createOrder = asyncHandler(async (req, res) => {
  // Destructure required data from request body and user object
  const { paymentMethod, couponApplied } = req.body;
  const { userId } = req.user;

  // Validate user ID is a valid MongoDB ID
  validateMongodbId(userId);

  // Find the user by their ID and populate their cart data
  const userCart = await Cart.findOne({ orderby: userId }).populate(
    "products.product"
  );

  if (!userCart) {
    res.json({ message: "No cart found" });
  }
  // Check if payment method is valid
  if (!["COD", "PAID"].includes(paymentMethod)) {
    return res.status(400).json({
      success: false,
      message: "Invalid payment method",
    });
  }

  // Calculate the final amount based on coupon applied and total after discount
  let finalAmount =
    couponApplied && userCart.totalAfterDiscount
      ? userCart.totalAfterDiscount
      : userCart.cartTotal;

  // Create a new order with the user's cart data and payment information
  const newOrder = await new Order({
    products: userCart.products,
    paymentIntent: {
      id: uniqid(),
      method: paymentMethod,
      amount: finalAmount,
      status: paymentMethod === "COD" ? "Cash on Delivery" : "Not Processed",
      created: Date.now(),
      currency: "ksh",
    },
    orderBy: userId,
    orderStatus: paymentMethod === "COD" ? "Cash on Delivery" : "Not Processed",
  }).save();

  // Update the product quantities and sold amounts using bulk write
  const updateOperations = userCart.products.map(({ product, count }) => ({
    updateOne: {
      filter: { _id: product._id },
      update: { $inc: { quantity: -count, sold: +count } },
    },
  }));
  await Product.bulkWrite(updateOperations);

  // Send success response with order data
  res.status(200).json({
    success: true,
    message: "Order placed successfully",
    order: newOrder,
  });

  // Clear the user's cart after successful order placement
  await Cart.findOneAndDelete({ orderby: userId });
  await UserCart.updateOne({ userId: userId }, { items: [] });
});

//get orders

const getOrders = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { status } = req.body;
  validateMongodbId(userId);

  let query = { orderBy: mongoose.Types.ObjectId(userId) };

  if (status) {
    query = { ...query, orderStatus: status };
  }

  const userorders = await Order.find(query)
    .populate({
      path: "products.product",
      populate: {
        path: "images",
        select: "_id url",
      },
    })
    .populate({
      path: "orderBy",
      select: "address _id firstname lastname email mobile",
    });

  if (!userorders || userorders.length === 0) {
    return res.status(404).json({ message: "No orders found for user" });
  }

  res.json(userorders);
});

//get orders by id

const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);

  const userorders = await Order.findById(id)
    .populate({
      path: "products.product",
      populate: {
        path: "images",
        select: "_id url",
      },
    })
    .populate({
      path: "orderBy",
      select: "address _id firstname lastname email mobile",
    });

  if (!userorders) {
    return res.status(404).json({ message: "order not found" });
  }

  res.json(userorders);
});

//get ALLorder
const getAllOrders = asyncHandler(async (req, res) => {
  const alluserorders = await Order.find()
    .populate("products.product")
    .populate("orderBy")
    .exec();
  res.json(alluserorders);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  validateMongodbId(id);
  const updateOrderStatus = await Order.findByIdAndUpdate(
    id,
    {
      orderStatus: status,
    },
    { new: true }
  );
  res.json(updateOrderStatus);
});

const saveAddress = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  validateMongodbId(userId);
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      address: req?.body?.address,
    },
    {
      new: true,
    }
  );
  res.json(updatedUser);
});

const userCart = asyncHandler(async (req, res) => {
  const { cart } = req.body;
  const { userId } = req.user;
  validateMongodbId(userId);

  // Create an array of product objects
  const products = await Promise.all(
    cart.map(async (item) => {
      const { id, count, color } = item;
      // Get the price of the product from the database
      const { price } = await Product.findById(id).select("price");
      return { product: id, count, color, price };
    })
  );

  // Calculate the total cost of the cart
  const cartTotal = products.reduce(
    (total, { price, count }) => total + price * count,
    0
  );

  // Find the existing cart object and update it with the new data, or create a new cart object if none exists
  const filter = { orderby: userId };
  const update = { products, cartTotal };
  const options = { new: true, upsert: true };
  const savedCart = await Cart.findOneAndUpdate(filter, update, options);

  // Return the saved cart object as the response
  res.json(savedCart);
});

const getUserCart = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  validateMongodbId(userId);
  const cart = await Cart.findOne({ orderby: userId })
    .populate("products.product")
    .populate("orderby");
  res.json(cart);
});

const emptyCart = async (req, res) => {
  const { userId } = req.user;
  validateMongodbId(userId);
  // Find the user's cart and delete it
  const cart = await Cart.findOneAndDelete({ orderby: userId });
  // If the cart is empty, send a message and return
  if (!cart) {
    return res.status(404).json({ message: "Cart is empty" });
  }

  res.json(cart);
};

module.exports = {
  createUser,
  logIn,
  getUsers,
  getUserById,
  getUserByEmail,
  deleteUser,
  verifyToken,
  getUserCount,
  updateUser,
  blockUser,
  unblockUser,
  updateUserDetails,
  forgotPassword,
  resetPassword,
  getWishlist,
  saveAddress,
  applyCoupon,
  createOrder,
  getOrders,
  updateOrderStatus,
  getAllOrders,
  getOrderById,
  userCart,
  getUserCart,
  emptyCart,
};
