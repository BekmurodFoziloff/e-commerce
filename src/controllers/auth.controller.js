import { Router } from 'express';
import usersService from '../services/users.service.js';
import authService from '../services/auth.service.js';
import { validateInput } from '../middlewares/validateInput.middleware.js';
import { loginSchema, registerSchema } from '../utils/enter.validators.js';
import redisService from '../config/redis.service.js';
import { validationResult } from 'express-validator';
import { registerMiddleware } from '../utils/error.validator.js';

class AuthController {
  path = '/auth';
  router = Router();

  constructor() {
    this.setRotes();
  }

  setRotes() {
    this.router.route(`${this.path}/register`).post(validateInput(registerSchema), registerMiddleware, this.register);
    this.router.route(`${this.path}/login`).post(validateInput(loginSchema), this.logIn);
    this.router.route(`${this.path}/logout`).post(this.logOut);
  }

  async register(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
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
          const token = await authService.generateToken(candidate.id);
          res.cookie('token', token, { httpOnly: true, secure: true });
          await redisService.setValue(`user:${candidate.id}`, JSON.stringify(candidate));
          return res.status(200).json({ token });
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
    res.clearCookie('token');
    return res.status(200).json('Successfully logged out');
  }
}

export default new AuthController().router;
