import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';

export const transporter = nodemailer.createTransport(
  smtpTransport({
    host: process.env.EMAIL_HOST,
    service: process.env.EMAIL_SERVICE,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  })
);

export const sendCreatedOrder = async (order) => {
  return {
    from: process.env.EMAIL_USER,
    to: order.customer.email,
    subject: 'New order created',
    html: `A new order has been created with the following details:<br><br>
    Customer Name: ${order.customer.name}<br>
    Products: ${order.products.map((product) => `${product.quantity} x ${product.product.name}`).join(', ')}<br>
    Subtotal Price: ${order.subTotalPrice}<br>
    Status: ${order.status}<br><br>
    Thank you.`
  };
};

export const sendUpdatedOrderStatus = async (order) => {
  return {
    from: process.env.EMAIL_USER,
    to: order.customer.email,
    subject: 'Order status updated',
    html: `
    The status of your order with ID ${order.id} has been updated to ${order.status}.<br><br>
    Thank you.`
  };
};
