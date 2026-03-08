// backend/middleware/auth.js



const { verifyAccess } = require("../utils/jwt");

module.exports = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const decoded = verifyAccess(token);

    // your code uses req.user.id in routes ✅
    req.user = { id: decoded.id };

    next();
  } catch (err) {
    console.log("Auth error:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};