

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.log("❌ ERROR: JWT_SECRET is missing in .env");
}

const signAccess = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

const verifyAccess = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = { signAccess, verifyAccess };