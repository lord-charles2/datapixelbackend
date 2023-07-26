const router = require("express").Router();
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const {
  createProduct,
  getaProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishlist,
  rating,
  getProductCount,
  isFeatured,
} = require("../controller/productCtl");

router.get("/", getAllProduct);
router.get("/:id", getaProduct);
router.post("/", authMiddleware, isAdmin, createProduct);
router.put("/wishlist/", authMiddleware, addToWishlist);
router.put("/rating", authMiddleware, rating);
router.patch("/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);
router.get("/productCount", authMiddleware, isAdmin, getProductCount);
router.get(`/get/isFeatured/:count?`, isFeatured);

module.exports = router;
