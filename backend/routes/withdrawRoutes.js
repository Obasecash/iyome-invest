const router = require("express").Router();
const withdrawController = require("../controllers/withdrawController");
const auth = require("../middleware/auth");

// Create withdraw request
router.post("/", auth, withdrawController.createWithdraw);

// Get my withdraw history
router.get("/", auth, withdrawController.getMyWithdraws);

module.exports = router;

