const jwt = require("jsonwebtoken");

/**
 * Verifies the JWT from the Authorization header (Bearer token).
 * Attaches { id, email, role } to req.user on success.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * RBAC guard. Usage: requireRole("FLEET_MANAGER", "SAFETY_OFFICER")
 * Must be used AFTER requireAuth.
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: requires one of [${allowedRoles.join(", ")}]`,
      });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
