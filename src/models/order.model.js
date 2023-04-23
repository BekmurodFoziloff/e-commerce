import { Schema, model } from 'mongoose';

const OrderSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    products: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true }
      }
    ],
    subTotalPrice: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'shipped', 'delivered'], default: 'pending' }
  },
  { timestamps: true }
);

const OrderModel = model('Order', OrderSchema);

export default OrderModel;
