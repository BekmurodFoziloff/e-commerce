import paymentModel from '../models/payment.model.js';

class PaymentsService {
  async findPaymentById(paymentId) {
    return await paymentModel.findOne({ paymentId });
  }

  async findAllPayments(userId) {
    return await paymentModel.find({ customer: userId });
  }

  async createPayment(paymentData) {
    const newPayment = await paymentModel.create(paymentData);
    return await newPayment.save();
  }
}

export default new PaymentsService();
