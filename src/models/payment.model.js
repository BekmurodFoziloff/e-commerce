import { Schema, model } from 'mongoose';

const PaymentSchema = new Schema({
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['succeeded', 'failed'], default: 'succeeded' },
  paymentDate: { type: Date, default: Date.now },
  paymentId: { type: String, required: true }
});

const UserModel = model('Payment', PaymentSchema);

export default UserModel;
