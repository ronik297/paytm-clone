const JWT_SECRET = require("./jwt_secret");
const jwt = require("jsonwebtoken");

async function authMiddleware(req, res, next) {
  const authHeaders = req.headers.authorization;

  if (!authHeaders || !authHeaders.startsWith("Bearer ")) {
    return res.status(403).json({});
  }

  const token = authHeaders.split(" ")[1];

  try {
    const decoded = JWT_SECRET.verify(token, JWT_SECRET);

    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403);
  }
}

module.exports = { authMiddleware };
