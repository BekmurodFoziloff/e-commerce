import { Router } from 'express';
import productsService from '../services/products.service.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import upload from '../config/files.service.js';
import redisService from '../config/redis.service.js';
import { validateInput } from '../middlewares/validateInput.middleware.js';
import { productSchema } from '../utils/inputData.validators.js';
import { validationResult } from 'express-validator';
import { productMiddleware } from '../utils/processError.validator.js';

class ProductsController {
  path = '/product';
  router = Router();

  constructor() {
    this.setRoutes();
  }

  setRoutes() {
    this.router.route(`${this.path}/:id`).get(this.findProductById);
    this.router.route(`${this.path}`).get(this.findAllProducts);
    this.router
      .route(`${this.path}/new`)
      .post(
        authMiddleware,
        upload.single('imageURL'),
        validateInput(productSchema),
        productMiddleware,
        this.createProduct
      );
    this.router
      .route(`${this.path}/:id/update`)
      .patch(
        authMiddleware,
        upload.single('imageURL'),
        validateInput(productSchema),
        productMiddleware,
        this.updateProduct
      );
    this.router.route(`${this.path}/:id/delete`).delete(authMiddleware, this.deleteProduct);
    this.router.route(`${this.path}/:id/image`).get(authMiddleware, this.getProductImage);
  }

  async findProductById(req, res, next) {
    try {
      const { id } = req.params;
      const cachedProduct = await redisService.getValue(`product:${id}`);
      if (cachedProduct) {
        return res.status(200).json(cachedProduct);
      } else {
        const product = await productsService.findProductById(id);
        if (product) {
          await redisService.setValue(`product:${id}`, product);
          return res.status(200).json(product);
        }
        return res.status(404).json(`Product with id ${id} not found`);
      }
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  async findAllProducts(req, res, next) {
    try {
      const cachedProducts = await redisService.getValue('products');
      if (cachedProducts && !req.query) {
        return res.status(200).json(cachedProducts);
      } else {
        const products = await productsService.findAllProducts(req.query);
        await redisService.setValue('products', products);
        return res.status(200).json(products);
      }
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  async createProduct(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }
      const newProduct = await productsService.createProduct(req.body, req.user, req.file.path);
      if (newProduct) {
        await redisService.setValue(`product:${newProduct.id}`, newProduct);
        return res.status(201).json(newProduct);
      }
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  async updateProduct(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }
      const { id } = req.params;
      const updatedProduct = await productsService.updateProduct(id, req.body);
      if (updatedProduct) {
        await redisService.setValue(`product:${id}`, updatedProduct);
        return res.status(200).json(updatedProduct);
      }
      return res.status(404).json(`Product with id ${id} not found`);
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      const deletedProduct = await productsService.deleteProduct(id);
      if (deletedProduct) {
        await redisService.deleteValue(`product:${id}`);
        return res.status(200).json(deletedProduct);
      }
      return res.status(404).json(`Product with id ${id} not found`);
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  async getProductImage(req, res, next) {
    try {
      const { id } = req.params;
      const cachedProduct = await redisService.getValue(`product:${id}`);
      const product = cachedProduct;
      if (product && product.imageURL) {
        res.setHeader('Content-Type', 'image/jpeg');
        return res.sendFile(product.imageURL);
      } else {
        const product = await productsService.findProductById(id);
        if (product) {
          await redisService.setValue(`product:${id}`, product);
          res.setHeader('Content-Type', 'image/jpeg');
          return res.sendFile(product.imageURL);
        }
        return res.status(404).json(`Product with id ${id} not found`);
      }
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }
}

export default new ProductsController().router;
