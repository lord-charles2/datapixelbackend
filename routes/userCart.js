const router = require("express").Router();

const {
  addToCart,
  getCartItems,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
} = require("../controller/userCartCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, addToCart);
router.get("/", authMiddleware, getCartItems);
router.patch("/", authMiddleware, updateCartItemQuantity);
router.put("/remove-one", authMiddleware, removeFromCart);
router.put("/", authMiddleware, clearCart);

module.exports = router;
