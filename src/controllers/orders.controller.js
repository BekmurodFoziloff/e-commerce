import { Router } from 'express';
import ordersService from '../services/orders.service.js';
import productsService from '../services/products.service.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { sendCreatedOrder, sendUpdatedOrderStatus } from '../config/emails.service.js';
import { isCustomerOrder } from '../middlewares/isCustomerOrder.middleware.js';
import redisService from '../config/redis.service.js';
import { validateInput } from '../middlewares/validateInput.middleware.js';
import { updaetOrderSchema, updateOrderStatusSchema } from '../utils/enter.validators.js';

class OrdersController {
  path = '/order';
  router = Router();

  constructor() {
    this.setRotes();
  }

  setRotes() {
    this.router.route(`${this.path}/:id`).get(authMiddleware, isCustomerOrder, this.findOrderById);
    this.router.route(`${this.path}`).get(authMiddleware, isCustomerOrder, this.findAllOrders);
    this.router.route(`${this.path}/new`).post(authMiddleware, this.createOrder);
    this.router
      .route(`${this.path}/:id/update`)
      .patch(authMiddleware, isCustomerOrder, validateInput(updaetOrderSchema), this.updateOrder);
    this.router.route(`${this.path}/:id/delete`).delete(authMiddleware, isCustomerOrder, this.deleteOrder);
    this.router
      .route(`${this.path}/status/:id/update`)
      .patch(authMiddleware, isCustomerOrder, validateInput(updateOrderStatusSchema), this.updateOrderStatus);
  }

  async findOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const cachedOrder = await redisService.getValue(`order:${id}`);
      if (cachedOrder) {
        return res.status(200).json(JSON.parse(cachedOrder));
      } else {
        const order = await ordersService.findOrderById(id);
        if (order) {
          await redisService.setValue(`order:${id}`, JSON.stringify(order));
          return res.status(200).json(order);
        }
        return res.status(404).json(`Order with id ${id} not found`);
      }
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  async findAllOrders(req, res, next) {
    try {
      const cachedOrders = await redisService.getValue('orders');
      if (cachedOrders) {
        return res.status(200).json(JSON.parse(cachedOrders));
      } else {
        const orders = await ordersService.findAllOrders(req.query, req.user.id);
        await redisService.setValue('orders', JSON.stringify(orders));
        return res.status(200).json(orders);
      }
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  async createOrder(req, res, next) {
    try {
      const cachedCart = await redisService.getValue('cart');
      let cart = req.cookies.cart || JSON.parse(cachedCart) || [];
      let subTotalPrice = 0;
      for (const item of cart) {
        const product = await productsService.findProductById(item.productId);
        subTotalPrice += product.price * item.quantity;
      }
      const newOrder = await ordersService.createOrder({
        customer: req.user,
        products: cart.map((item) => ({
          product: item.productId,
          quantity: item.quantity
        })),
        subTotalPrice
      });
      if (newOrder) {
        await redisService.setValue(`order:${newOrder.id}`, JSON.stringify(newOrder));
        await redisService.deleteValue('cart');
        res.clearCookie('cart');
        await sendCreatedOrder(newOrder);
        return res.status(201).json(newOrder);
      }
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  async updateOrder(req, res, next) {
    try {
      const { id } = req.params;
      const updatedOrder = await ordersService.updateOrder(id, req.body);
      let subTotalPrice = 0;
      for (const item of updatedOrder.products) {
        const product = await productsService.findProductById(item.product.id);
        subTotalPrice += product.price * item.quantity;
      }
      await ordersService.updateOrderSubTotalPrice(id, subTotalPrice);
      if (updatedOrder) {
        await redisService.setValue(`order:${id}`, JSON.stringify(updatedOrder));
        return res.status(200).json(updatedOrder);
      }
      return res.status(404).json(`Order with id ${id} not found`);
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  async deleteOrder(req, res, next) {
    try {
      const { id } = req.params;
      const deletedOrder = await ordersService.deleteOrder(id);
      if (deletedOrder) {
        await redisService.deleteValue(`order:${id}`);
        return res.status(200).json(deletedOrder);
      }
      return res.status(404).json(`Order with id ${id} not found`);
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const updatedOrder = await ordersService.updateOrderStatus(id, req.body.status);
      if (updatedOrder) {
        await sendUpdatedOrderStatus(updatedOrder);
        await redisService.setValue(`order:${id}`, JSON.stringify(updatedOrder));
        return res.status(200).json(updatedOrder);
      }
      return res.status(404).json(`Order with id ${id} not found`);
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }
}

export default new OrdersController().router;
