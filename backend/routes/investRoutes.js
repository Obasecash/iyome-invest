
const express = require("express");
const router = express.Router();
const investController = require("../controllers/investController");
const auth = require("../middleware/auth");

router.post("/create", auth, investController.createInvestment);
router.get("/my", auth, investController.getMyInvestments);
router.get("/profit/:id", auth, investController.calculateProfit);

// admin
router.get("/all", auth, investController.getAllInvestments);
router.put("/approve/:id", auth, investController.approveInvestment);
router.put("/complete/:id", auth, investController.completeInvestment);

module.exports = router;

