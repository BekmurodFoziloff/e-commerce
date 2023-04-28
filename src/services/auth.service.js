import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

class AuthService {
  async hashPassword(password, salt) {
    return await bcryptjs.hash(password, salt);
  }

  async verifyPassword(plainTextPassword, hashedPassword) {
    return await bcryptjs.compare(plainTextPassword, hashedPassword);
  }

  async getCookieWithJwtToken(userId) {
    const payload = { userId };
    const secret = process.env.JWT_TOKEN_SECRET;
    const expiresIn = { expiresIn: `${process.env.JWT_TOKEN_EXPIRATION_TIME}s` };
    const token = jwt.sign(payload, secret, expiresIn);
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${process.env.JWT_TOKEN_EXPIRATION_TIME}`;
  }

  async getCookiesForLogOut() {
    return 'Authentication=; HttpOnly; Path=/; Max-Age=0';
  }
}

export default new AuthService();
