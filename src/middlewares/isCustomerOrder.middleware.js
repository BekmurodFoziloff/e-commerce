import ordersService from '../services/orders.service.js';

export async function isCustomerOrder(req, res, next) {
  try {
    const { id } = req.params;
    const order = await ordersService.findOrderById(id);
    if (!(order?.customer.id.toString() === req.user.id.toString())) {
      return res.status(400).json(`Order with id ${id} not found`);
    }
    next();
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}
