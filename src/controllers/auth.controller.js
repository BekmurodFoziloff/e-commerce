import { Router } from 'express';
import usersService from '../services/users.service.js';
import authService from '../services/auth.service.js';
import { validateInput } from '../middlewares/validateInput.middleware.js';
import { loginSchema, registerSchema } from '../utils/inputData.validators.js';
import redisService from '../config/redis.service.js';
import { validationResult } from 'express-validator';
import { registerMiddleware } from '../utils/processError.validator.js';

class AuthController {
  path = '/auth';
  router = Router();

  constructor() {
    this.setRotes();
  }

  setRotes() {
    this.router.route(`${this.path}/register`).post(validateInput(registerSchema), registerMiddleware, this.register);
    this.router.route(`${this.path}/login`).post(validateInput(loginSchema), this.logIn);
    this.router.route(`${this.path}/logout`).get(this.logOut);
  }

  async register(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }
      const candidate = await usersService.findUserByEmail(req.body.email);
      if (candidate) {
        return res.status(400).json('User with email already exists');
      } else {
        const hashedPassword = await authService.hashPassword(req.body.password, 10);
        const user = await usersService.createUser({
          ...req.body,
          password: hashedPassword
        });
        await redisService.setValue(`user:${user.id}`, JSON.stringify(user));
        return res.status(201).json(user);
      }
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  async logIn(req, res, next) {
    try {
      const candidate = await usersService.findUserByEmail(req.body.email);
      if (candidate) {
        const isPasswordMatching = await authService.verifyPassword(req.body.password, candidate.password);
        if (isPasswordMatching) {
          const tokenCookie = await authService.getCookieWithJwtToken(candidate.id);
          res.setHeader('Set-Cookie', tokenCookie);
          await redisService.setValue(`user:${candidate.id}`, JSON.stringify(candidate));
          return res.status(200).json(candidate);
        } else {
          return res.status(400).json('Wrong credentials provided');
        }
      } else {
        return res.status(400).json('Wrong credentials provided');
      }
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  async logOut(req, res, next) {
    const cookiesForLogOut = await authService.getCookiesForLogOut();
    // res.clearCookie('token');
    res.setHeader('Set-Cookie', cookiesForLogOut);
    return res.sendStatus(200);
  }
}

export default new AuthController().router;
