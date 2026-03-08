const router = require("express").Router();
const authUser = require("../middleware/authUser");
const User = require("../models/User");
const { getInvestorProfile } = require("../Controllers/walletController");


// ✅ ADD IT HERE
// GET /api/investor/profile
router.get("/profile", authUser, getInvestorProfile);


// 👇 THIS STAYS BELOW
// GET /api/users/:id
router.get("/:id", authUser, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
