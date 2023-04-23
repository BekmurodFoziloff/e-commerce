import paymentsService from '../services/payments.service.js';

export async function isCustomerPayment(req, res, next) {
  try {
    const { id } = req.params;
    const payment = await paymentsService.findPaymentById(id);
    if (!(payment?.customer.id.toString() === req.user.id.toString())) {
      return res.status(400).json(`Payment with id ${id} not found`);
    }
    next();
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}
