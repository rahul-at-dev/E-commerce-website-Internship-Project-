const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Authentication required. Provide a Bearer token.' });
  try {
    const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('_id name email');
    if (!user) return res.status(401).json({ success: false, message: 'The account for this token no longer exists.' });
    req.user = user;
    next();
  } catch (_error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
}
module.exports = { protect };
