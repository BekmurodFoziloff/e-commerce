import { Router } from 'express';
import usersService from '../services/users.service.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import upload from '../services/files.service.js';
import redisService from '../services/redis.service.js';
import { validateInput } from '../middlewares/validateInput.middleware.js';
import { updateUserAddressSchema, updateUserSchema } from '../validators/joiSchemes.validator.js';
import { validationResult } from 'express-validator';
import { updateUserAddressMiddleware, updateUserMiddleware } from '../validators/expressMiddlewares.validator.js';

class UsersController {
  path = '/user';
  router = Router();

  constructor() {
    this.setRoutes();
  }

  setRoutes() {
    this.router.route(`${this.path}/:id`).get(authMiddleware, this.findUserById);
    this.router.route(`${this.path}`).get(authMiddleware, this.findAllUsers);
    this.router
      .route(`${this.path}/:id/update`)
      .patch(authMiddleware, validateInput(updateUserSchema), updateUserMiddleware, this.updateUser);
    this.router.route(`${this.path}/:id/delete`).delete(authMiddleware, this.deleteUser);
    this.router
      .route(`${this.path}/:id/update/address`)
      .patch(
        authMiddleware,
        validateInput(updateUserAddressSchema),
        updateUserAddressMiddleware,
        this.updateUserAddress
      );
    this.router.route(`${this.path}/:id/avatar`).patch(authMiddleware, upload.single('avatar'), this.addUserAvatar);
    this.router.route(`${this.path}/:id/image`).get(authMiddleware, this.getUserAvatar);
  }

  async findUserById(req, res, next) {
    try {
      const { id } = req.params;
      const cachedUser = await redisService.getValue(`user:${id}`);
      if (cachedUser) {
        return res.status(200).json(cachedUser);
      } else {
        const user = await usersService.findUserById(id);
        if (user) {
          await redisService.setValue(`user:${id}`, user);
          return res.status(200).json(user);
        }
        return res.status(404).json(`User with id ${id} not found`);
      }
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  async findAllUsers(req, res, next) {
    try {
      const { page } = req.query;
      const cachedUsers = await redisService.getValue('users');
      if (cachedUsers && !page) {
        res.status(200).json(cachedUsers);
      } else {
        const users = await usersService.findAllUsers(page);
        await redisService.setValue('users', users);
        return res.status(200).json(users);
      }
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  async updateUser(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }
      const { id } = req.params;
      const updatedUser = await usersService.updateUser(id, req.body);
      if (updatedUser) {
        await redisService.setValue(`user:${id}`, updatedUser);
        return res.status(200).json(updatedUser);
      }
      return res.status(404).json(`User with id ${id} not found`);
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const deletedUser = await usersService.deleteUser(id);
      if (deletedUser) {
        await redisService.deleteValue(`user:${id}`);
        return res.status(200).json(deletedUser);
      }
      return res.status(404).json(`User with id ${id} not found`);
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  async updateUserAddress(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }
      const { id } = req.params;
      const updatedUser = await usersService.updateUserAddress(id, req.body);
      if (updatedUser) {
        await redisService.setValue(`user:${id}`, updatedUser);
        return res.status(200).json(updatedUser);
      }
      return res.status(404).json(`User with id ${id} not found`);
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  async addUserAvatar(req, res, next) {
    try {
      const { id } = req.params;
      const updatedUser = await usersService.addUserAvatar(id, req.file.path);
      if (updatedUser) {
        await redisService.setValue(`user:${id}`, updatedUser);
        return res.status(200).json(updatedUser);
      }
      return res.status(404).json(`User with id ${id} not found`);
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  async getUserAvatar(req, res, next) {
    try {
      const { id } = req.params;
      const cachedUser = await redisService.getValue(`user:${id}`);
      if (cachedUser && cachedUser.avatar) {
        return res.sendFile(cachedUser.avatar);
      } else {
        const user = await usersService.findUserById(id);
        if (user) {
          await redisService.setValue(`user:${id}`, user);
          return res.sendFile(user.avatar);
        }
        return res.status(404).json(`User with id ${id} not found`);
      }
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }
}

export default new UsersController().router;
