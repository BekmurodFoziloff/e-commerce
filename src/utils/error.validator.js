import { body } from 'express-validator';

export const registerMiddleware = [
  body('email')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Invalid email address.'),
  body('userName').trim().escape().notEmpty().withMessage('Username is required.'),
  body('firstName').trim().escape().notEmpty().withMessage('First name is required.'),
  body('lastName').trim().escape().notEmpty().withMessage('Last name is required.'),
  body('password').trim().escape().notEmpty().withMessage('Password is required.')
];

export const updateUserMiddleware = [
  body('userName').trim().escape().notEmpty().withMessage('Username is required.'),
  body('firstName').trim().escape().notEmpty().withMessage('First name is required.'),
  body('lastName').trim().escape().notEmpty().withMessage('Last name is required.')
];

export const updateUserAddressMiddleware = [
  body('street').trim().escape().notEmpty().withMessage('Street is required.'),
  body('city').trim().escape().notEmpty().withMessage('City is required.'),
  body('state').trim().escape().notEmpty().withMessage('State is required.'),
  body('country').trim().escape().notEmpty().withMessage('Country is required.'),
  body('zipCode').trim().escape().notEmpty().withMessage('Zip code is required.')
];

export const productMiddleware = [
  body('name').trim().escape().notEmpty().withMessage('Name is required.'),
  body('description').trim().escape().notEmpty().withMessage('Description is required.'),
  body('price').isNumeric().withMessage('Price must be a numeric value.').notEmpty().withMessage('Price is required.'),
  body('category').trim().escape().notEmpty().withMessage('Category is required.'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer.')
    .notEmpty()
    .withMessage('Quantity is required.')
];
