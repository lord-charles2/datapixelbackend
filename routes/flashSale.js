const router = require("express").Router();
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const {
  AddFlashSale,
  removeExpiredFlashSaleProducts,
  getActiveFlashSaleProducts,
  getInActiveFlashSaleProducts,
  getAllFlashSaleProducts,
  getFlashSaleProductById,
  updateFlashSaleProduct,
  deleteFlashSaleProduct,
  getSalesAnalytics,
} = require("../controller/FlashSale");

router.get("/all", getAllFlashSaleProducts);
router.get("/:id", getFlashSaleProductById);
router.get(
  "/get/getSalesAnalytics",
  authMiddleware,
  isAdmin,
  getSalesAnalytics
);
router.get("/get/active", getActiveFlashSaleProducts);
router.get("/get/inactive", getInActiveFlashSaleProducts);
router.post("/add-product", authMiddleware, isAdmin, AddFlashSale);
router.patch("/:id", authMiddleware, isAdmin, updateFlashSaleProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteFlashSaleProduct);
router.delete(
  "/delete/expired",
  authMiddleware,
  isAdmin,
  removeExpiredFlashSaleProducts
);

module.exports = router;
