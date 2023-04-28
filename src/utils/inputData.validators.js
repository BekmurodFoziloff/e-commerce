import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().required(),
  userName: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  password: Joi.string().required()
});

export const loginSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required()
});

export const updateUserSchema = Joi.object({
  userName: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required()
});

export const updateUserAddressSchema = Joi.object({
  street: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  country: Joi.string().required(),
  zipCode: Joi.string().required()
});

export const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  category: Joi.string().required(),
  quantity: Joi.number().integer().required()
});

export const createCartSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().integer().required()
});

export const updateCartSchema = Joi.object({
  quantity: Joi.number().integer().required()
});

export const updaetOrderSchema = Joi.object({
  products: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().required(),
        quantity: Joi.number().integer().required()
      })
    )
    .required()
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string().required()
});

export const createPaymentSchema = Joi.object({
  orderId: Joi.string().required(),
  customerId: Joi.string().required(),
  amount: Joi.number().required(),
  name: Joi.string().required(),
  email: Joi.string().required(),
  token: Joi.string().required()
});
