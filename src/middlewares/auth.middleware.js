import jwt from 'jsonwebtoken';
import usersService from '../services/users.service.js';

async function authMiddleware(req, res, next) {
  // const token = req.cookies.token; //|| req.headers.authorization?.split(' ')[1] || req.query.token || req.body.token;
  const cookies = req.cookies;
  if (cookies && cookies.Authentication) {
    const secret = process.env.JWT_TOKEN_SECRET;
    try {
      const decoded = jwt.verify(cookies.Authentication, secret);
      const user = await usersService.findUserById(decoded.userId);
      if (user) {
        req.user = user;
        next();
      } else {
        res.status(401).json('Unauthorized');
      }
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  } else {
    res.status(401).json('Unauthorized');
  }
}

export default authMiddleware;
