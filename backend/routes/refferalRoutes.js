const router = require("express").Router();
const auth = require("../middleware/auth");
const { applyReferral } = require("../controllers/referralController");

router.post("/apply", auth, applyReferral);

module.exports = router;