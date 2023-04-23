import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

class AuthService {
  async hashPassword(password, salt) {
    return await bcryptjs.hash(password, salt);
  }

  async verifyPassword(plainTextPassword, hashedPassword) {
    return await bcryptjs.compare(plainTextPassword, hashedPassword);
  }

  async generateToken(id) {
    const payload = { id };
    const secret = process.env.JWT_TOKEN_SECRET;
    const expiresIn = { expiresIn: process.env.JWT_TOKEN_EXPIRATION_TIME };
    return jwt.sign(payload, secret, expiresIn);
  }
}

export default new AuthService();
