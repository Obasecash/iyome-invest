const express = require("express");
const router = express.Router();

const admin = require("../controllers/adminController");

// stats
router.get("/analytics/stats", admin.getStats);

// plans
router.get("/plans", admin.getPlans);
router.post("/plans", admin.createPlan);
router.put("/plans/:id", admin.updatePlan);

// investments
router.get("/investments", admin.getAllInvestments);

// deposits
router.get("/deposits", admin.getAllDeposits);
router.put("/deposits/approve/:id", admin.approveDeposit);
router.put("/deposits/reject/:id", admin.rejectDeposit);

module.exports = router;

