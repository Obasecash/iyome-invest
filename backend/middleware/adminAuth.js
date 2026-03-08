
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "Admin only" });
    }

    req.user = decoded;
    next();

  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};


