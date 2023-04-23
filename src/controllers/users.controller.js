import { Router } from 'express';
import usersService from '../services/users.service.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { upload } from '../config/files.service.js';
import path from 'path';
import { fileURLToPath } from 'url';
import redisService from '../config/redis.service.js';
import { validateInput } from '../middlewares/validateInput.middleware.js';
import { updateUserAddressSchema, updateUserSchema } from '../utils/enter.validators.js';
import { validationResult } from 'express-validator';
import { updateUserAddressMiddleware, updateUserMiddleware } from '../utils/error.validator.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UsersController {
  path = '/user';
  router = Router();

  constructor() {
    this.setRotes();
  }

  setRotes() {
    this.router.route(`${this.path}`).get(authMiddleware, this.findUserById);
    this.router.route(`${this.path}`).get(authMiddleware, this.findAllUsers);
    this.router
      .route(`${this.path}/update`)
      .patch(authMiddleware, validateInput(updateUserSchema), updateUserMiddleware, this.updateUser);
    this.router.route(`${this.path}/delete`).delete(authMiddleware, this.deleteUser);
    this.router
      .route(`${this.path}/address/update`)
      .patch(
        authMiddleware,
        validateInput(updateUserAddressSchema),
        updateUserAddressMiddleware,
        this.updateUserAddress
      );
    this.router.route(`${this.path}/avatar`).patch(authMiddleware, upload.single('avatar'), this.addAvatar);
    this.router.route(`${this.path}/image/:filename`).get(authMiddleware, this.getProductImage);
  }

  async findUserById(req, res, next) {
    try {
      const { id } = req.user;
      const cachedUser = await redisService.getValue(`user:${id}`);
      if (cachedUser) {
        return res.status(200).json(JSON.parse(cachedUser));
      } else {
        const user = await usersService.findUserById(id);
        if (user) {
          await redisService.setValue(`user:${id}`, JSON.stringify(user));
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
      const cachedUsers = await redisService.getValue('users');
      if (cachedUsers) {
        res.status(200).json(JSON.parse(cachedUsers));
      } else {
        const users = await usersService.findAllUsers();
        await redisService.setValue('users', JSON.stringify(users));
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
        return res.status(400).json({ errors: errors.array() });
      }
      const { id } = req.user;
      const updatedUser = await usersService.updateUser(id, req.body);
      if (updatedUser) {
        await redisService.setValue(`user:${id}`, JSON.stringify(updatedUser));
        return res.status(200).json(updatedUser);
      }
      return res.status(404).json(`User with id ${id} not found`);
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { id } = req.user;
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
        return res.status(400).json({ errors: errors.array() });
      }
      const { id } = req.user;
      const updatedUser = await usersService.updateUserAddress(id, req.body);
      if (updatedUser) {
        await redisService.setValue(`user:${id}`, JSON.stringify(updatedUser));
        return res.status(200).json(updatedUser);
      }
      return res.status(404).json(`User with id ${id} not found`);
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  async addAvatar(req, res, next) {
    try {
      const { id } = req.user;
      const updatedUser = await usersService.addAvatar(id, req.file.path);
      if (updatedUser) {
        await redisService.setValue(`user:${id}`, JSON.stringify(updatedUser));
        return res.status(200).json(updatedUser);
      }
      return res.status(404).json(`User with id ${id} not found`);
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  async getProductImage(req, res, next) {
    try {
      const filePath = path.join(__dirname, '../uploads/avatarImages', req.params.filename);
      return res.status(200).json({ filePath });
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }
}

export default new UsersController().router;
