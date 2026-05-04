const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.error(`[v0] Role check failed: user role "${req.user.role}" not in allowed roles [${roles.join(', ')}]`);
      return res.status(403).json({ 
        message: 'Unauthorized role',
        userRole: req.user.role,
        requiredRoles: roles
      });
    }
    next();
  };
};

module.exports = { authMiddleware, roleMiddleware };
