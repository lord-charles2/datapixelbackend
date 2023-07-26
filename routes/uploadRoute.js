const router = require("express").Router();
const { uploadImages, deleteImages } = require("../controller/uploadCtrl");
const { uploadPhoto, productImgResize } = require("../middlewares/uploadImage");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.post(
  "/",
  uploadPhoto.array("images", 10),
  authMiddleware,
  productImgResize,
  uploadImages
);

router.delete("/delete-img/:id", authMiddleware, isAdmin, deleteImages);

module.exports = router;
