const router = require("express").Router();
const {
  webhookTrigger,
  stkpush,
  paymentStatus,
} = require("../controller/payment");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, stkpush);
router.post("/transaction-complete", webhookTrigger);
router.post("/status", paymentStatus);

module.exports = router;
