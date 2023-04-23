import { Router } from 'express';
import productsService from '../services/products.service.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import redisService from '../config/redis.service.js';
import { validateInput } from '../middlewares/validateInput.middleware.js';
import { createCartSchema, updateCartSchema } from '../utils/enter.validators.js';

class CartsController {
  path = '/cart';
  router = Router();

  constructor() {
    this.setRotes();
  }

  setRotes() {
    this.router.route(`${this.path}`).get(authMiddleware, this.getCart);
    this.router.route(`${this.path}/new`).post(authMiddleware, validateInput(createCartSchema), this.createCart);
    this.router
      .route(`${this.path}/:productId/update`)
      .patch(authMiddleware, validateInput(updateCartSchema), this.updateCart);
    this.router.route(`${this.path}/:productId/delete`).delete(authMiddleware, this.deleteCart);
  }

  async createCart(req, res, next) {
    try {
      const { productId, quantity } = req.body;
      const cachedCart = await redisService.getValue('cart');
      let cart = req.cookies.cart || JSON.parse(cachedCart) || [];
      const existingItemIndex = cart.findIndex((item) => item.productId === productId);
      if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += quantity;
      } else {
        cart.push({ productId, quantity });
      }
      await redisService.setValue('cart', JSON.stringify(cart));
      res.cookie('cart', cart, { httpOnly: true, secure: true });
      res.status(201).json('Item added to cart');
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  async getCart(req, res, next) {
    try {
      const cachedCart = await redisService.getValue('cart');
      const cart = req.cookies.cart || JSON.parse(cachedCart) || [];
      const productIds = cart.map((item) => item.productId);
      const products = await productsService.findProductByIds(productIds);
      const cartItems = cart.map((item) => {
        const product = products.find((p) => p._id.toString() === item.productId);
        return {
          product,
          quantity: item.quantity
        };
      });
      res.status(200).json(cartItems);
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  async updateCart(req, res, next) {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;
      const cachedCart = await redisService.getValue('cart');
      let cart = req.cookies.cart || JSON.parse(cachedCart) || [];
      const itemIndex = cart.findIndex((item) => item.productId === productId);
      if (itemIndex !== -1) {
        cart[itemIndex].quantity = quantity;
      }
      await redisService.setValue('cart', JSON.stringify(cart));
      res.cookie('cart', cart, { httpOnly: true, secure: true });
      res.status(200).json('Cart item quantity updated');
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  async deleteCart(req, res, next) {
    try {
      const { productId } = req.params;
      const cachedCart = await redisService.getValue('cart');
      let cart = req.cookies.cart || JSON.parse(cachedCart) || [];
      const itemIndex = cart.findIndex((item) => item.productId === productId);
      if (itemIndex !== -1) {
        cart.splice(itemIndex, 1);
      }
      await redisService.setValue('cart', JSON.stringify(cart));
      res.cookie('cart', cart, { httpOnly: true, secure: true });
      res.status(200).json('Item removed from cart');
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }
}

export default new CartsController().router;
