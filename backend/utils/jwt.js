const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'urbanease-super-secret-key-change-in-production';
const JWT_EXPIRE = '7d';

class JWTService {
  static generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRE,
      issuer: 'urbanease-api'
    });
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static generateTokens(user) {
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role || 'user',
      name: user.name
    };

    return {
      accessToken: this.generateToken(payload),
      refreshToken: this.generateToken({ id: user._id })
    };
  }
}

module.exports = JWTService;