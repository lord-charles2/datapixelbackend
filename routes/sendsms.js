const router = require("express").Router();
const { sendsms, sendsms2, sendsms3 } = require("../controller/sendsms");

router.post("/", sendsms);
router.post("/advata", sendsms2);
router.post("/textsms", sendsms3);

module.exports = router;
