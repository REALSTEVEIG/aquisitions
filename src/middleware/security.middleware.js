import aj from '#config/arcject.js';

const securityMiddleware = async (req, res, next) => {
  try {
    const role = req.user?.role || 'guest';

    let limit;

    switch (role) {
      case 'admin':
        limit = 20;
        break;
      case 'user':
        limit = 10;
        break;
      default:
        limit = 5;
        break;
    }

    const decision = await aj.protect(req, {
      requested: limit,
    });

    if (decision.isDenied()) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded',
        reason: decision.reason,
      });
    }

    next();
  } catch (error) {
    console.error(`Arcjet middleware error:`, error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong with security middleware',
    });
  }
};

export default securityMiddleware;
