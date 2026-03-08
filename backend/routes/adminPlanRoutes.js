const express = require("express");
const router = express.Router();

const adminAuth = require("../middleware/adminAuth");
const {
  createPlan,
  getPlans
} = require("../controllers/adminPlanController");

router.post("/", adminAuth, createPlan);
router.get("/", adminAuth, getPlans);

module.exports = router;