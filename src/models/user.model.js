import { Schema, model } from 'mongoose';

const AddressSchema = new Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: Number, required: true }
  },
  { timestamps: true }
);

const UserSchema = new Schema(
  {
    email: { type: String, index: 1, required: true },
    userName: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    avatar: { type: String },
    address: AddressSchema
  },
  { timestamps: true }
);

UserSchema.index({ email: -1 });

const UserModel = model('User', UserSchema);

export default UserModel;
