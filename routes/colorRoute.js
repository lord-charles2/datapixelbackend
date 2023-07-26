const router = require("express").Router();

const {
  createColor,
  updateColor,
  deleteColor,
  getColors,
  getSingleColor,
} = require("../controller/colorCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, isAdmin, createColor);
router.put("/:id", authMiddleware, isAdmin, updateColor);
router.delete("/:id", authMiddleware, isAdmin, deleteColor);
router.get("/:id", getSingleColor);
router.get("/", getColors);

module.exports = router;
