const jwt = require("jsonwebtoken");

async function authMiddleware(req, res, next) {
  const authHeaders = req.headers.authorization;

  if (!authHeaders || !authHeaders.startsWith("Bearer ")) {
    return res.status(403).json({});
  }
  const token = authHeaders.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(403).json({ error });
  }
}

module.exports = { authMiddleware };
