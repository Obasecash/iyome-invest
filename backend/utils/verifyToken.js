// backend/utils/verifyToken.js
import jwt from "jsonwebtoken";

// use the same secret as authRoutes.js
const JWT_SECRET = process.env.JWT_SECRET || "iyome-secret-2025";

export default function verifyToken(req, res, next) {
  const header = req.headers["authorization"];

  if (!header) {
    return res
      .status(401)
      .json({ ok: false, message: "No token provided" });
  }

  // Expect "Bearer <token>"
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res
      .status(401)
      .json({ ok: false, message: "Invalid token format" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // ✅ same secret
    req.user = decoded; // { id, email, name }
    next();
  } catch (err) {
    console.error("JWT verify error:", err.message);
    return res
      .status(401)
      .json({ ok: false, message: "Token expired or invalid" });
  }
}