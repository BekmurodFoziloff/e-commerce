import userModel from '../models/user.model.js';

class UsersService {
  async findUserByEmail(email) {
    return await userModel.findOne({ email });
  }

  async findUserById(id) {
    return await userModel.findById(id);
  }

  async findAllUsers(page) {
    let pageNumber = 1;
    const pageSize = Number(process.env.PAGE_SIZE);
    if (page) {
      pageNumber = page;
    }
    return await userModel
      .find()
      .sort({ createdAt: -1 })
      .skip(pageNumber * pageSize - pageSize)
      .limit(pageSize);
  }

  async createUser(userData) {
    const newUser = await userModel.create(userData);
    return await newUser.save();
  }

  async updateUser(id, userData) {
    return await userModel.findByIdAndUpdate(id, userData, { returnDocument: 'after' });
  }

  async deleteUser(id) {
    return await userModel.findByIdAndDelete(id);
  }

  async updateUserAddress(id, addressData) {
    return await userModel.findByIdAndUpdate(id, { $set: { address: addressData } }, { returnDocument: 'after' });
  }

  async addAvatar(id, avatar) {
    console.log(avatar);
    return await userModel.findByIdAndUpdate(id, { $set: { avatar } }, { returnDocument: 'after' });
  }
}

export default new UsersService();
