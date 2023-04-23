import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';
import { errorHandler } from './middlewares/errorHandler.middleware.js';
import morganMiddleware from './middlewares/morgan.middleware.js';
import usersController from './controllers/users.controller.js';
import authController from './controllers/auth.controller.js';
import productsController from './controllers/products.controller.js';
import cartsController from './controllers/carts.controller.js';
import paymentsController from './controllers/payments.controller.js';
import ordersController from './controllers/orders.controller.js';
import logger from './utils/logger.js';

class App {
  constructor() {
    this.app = express();
    this.setConfig();
    this.setControllers();
    this.setMongoConfig();
    this.setErrorHandlingMiddleware();
    this.setSwaggerConfig();
  }

  setConfig() {
    this.app.use(express.json());
    this.app.use(bodyParser.json({ limit: '50mb' }));
    this.app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
    this.app.use(cookieParser());
    this.app.use(cors());
    this.app.use(morganMiddleware);
  }

  setMongoConfig() {
    mongoose.Promise = global.Promise;
    const MONGO_URI = process.env.MONGO_URI;
    mongoose
      .connect(MONGO_URI)
      .then(() => {
        logger.info('Connected to MongoDB server');
      })
      .catch((error) => {
        logger.error(error);
      });
    mongoose.set('toJSON', {
      virtuals: true,
      transform: (doc, converted) => {
        delete converted._id;
        delete converted.__v;
      }
    });
  }

  setSwaggerConfig() {
    const options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'E-Commerce API',
          version: '1.0.0',
          description: 'E-Commerce API',
          license: {
            name: 'MIT',
            url: 'https://spdx.org/licenses/MIT.html'
          }
        },
        servers: [
          {
            url: 'http://localhost:3000'
          }
        ]
      },
      apis: ['./controllers/*.js']
    };
    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs, { explorer: true }));
  }

  setControllers() {
    this.app.use('/', usersController);
    this.app.use('/', authController);
    this.app.use('/', productsController);
    this.app.use('/', cartsController);
    this.app.use('/', paymentsController);
    this.app.use('/', ordersController);
  }

  setErrorHandlingMiddleware() {
    this.app.use(errorHandler);
  }
}

export default new App().app;
