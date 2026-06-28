const jwt = require('jsonwebtoken');

/**
 * Express middleware that protects admin routes.
 * Expects an `Authorization: Bearer <token>` header containing a JWT
 * signed with JWT_SECRET. On success, attaches `req.admin` and calls next().
 */
function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Missing authentication token.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = payload;
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

module.exports = requireAdmin;
