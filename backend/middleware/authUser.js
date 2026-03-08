// backend/middleware/authUser.js

const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function authUser(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded should contain user id
    req.user = { id: decoded.id };

    // (Optional: verify user still exists)
    const user = await User.findById(decoded.id).select("_id");
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    next();
  } catch (err) {
    console.error("authUser error:", err);
    return res.status(401).json({ message: "Token is not valid" });
  }
};