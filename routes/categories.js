const router = require("express").Router();
const {
  getCategories,
  getCategoryById,
  postCategory,
  deleteCategory,
  updateCategory,
} = require("../controller/categoriesCtl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.post("/", authMiddleware, isAdmin, postCategory);
router.put("/:id", authMiddleware, isAdmin, updateCategory);
router.delete("/:id", authMiddleware, isAdmin, deleteCategory);

module.exports = router;
