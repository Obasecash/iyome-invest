const router = require("express").Router();
const adminAuth = require("../middleware/adminAuth");
const { stats } = require("../controllers/adminAnalyticsController");

router.get("/stats", adminAuth, stats);

module.exports = router;