import { Schema, model } from 'mongoose';

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageURL: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
    owner: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

const ProductModel = model('Product', ProductSchema);

export default ProductModel;
