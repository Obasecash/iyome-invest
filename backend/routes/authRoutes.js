const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/authController");
const User = require("../models/User");
const { signAccess, signRefresh, verifyRefresh } = require("../utils/jwt");


/* =========================
   REGISTER
========================= */
router.post("/register", register);


/* =========================
   LOGIN
========================= */
router.post("/login", login);


/* =========================
   REFRESH TOKEN
========================= */
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.sendStatus(401);
  }

  try {
    const payload = verifyRefresh(refreshToken);

    const user = await User.findById(payload.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.sendStatus(403);
    }

    const accessToken = signAccess({
      id: user._id,
      role: user.role
    });

    res.json({ accessToken });

  } catch (err) {
    res.sendStatus(403);
  }
});


/* =========================
   LOGOUT
========================= */
router.post("/logout", async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    const user = await User.findOne({ refreshToken });

    if (user) {
      user.refreshToken = null;
      await user.save();
    }
  }

  res.json({ message: "Logged out successfully" });
});


module.exports = router;
