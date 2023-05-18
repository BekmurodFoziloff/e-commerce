import productModel from '../models/product.model.js';

class ProductsService {
  async findProductById(id) {
    return await productModel.findById(id).populate('owner', '-password');
  }

  async findProductByIds(productIds) {
    return await productModel.find({ _id: { $in: productIds } }).populate('owner', '-password');
  }

  async findAllProducts(queryObject) {
    let query = {};
    let pageNumber = 1;
    const pageSize = Number(process.env.PAGE_SIZE);
    if (queryObject.page) {
      pageNumber = queryObject.page;
    }
    if (queryObject.search) {
      query = {
        $or: [
          { name: { $regex: queryObject.search, $options: 'i' } },
          { description: { $regex: queryObject.search, $options: 'i' } }
        ]
      };
    } else if (queryObject.minPrice) {
      query.price = { $gte: queryObject.minPrice };
    } else if (queryObject.maxPrice) {
      query.price = { $lte: queryObject.maxPrice };
    } else if (queryObject.category) {
      query.category = queryObject.category;
    }
    return await productModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(pageNumber * pageSize - pageSize)
      .limit(pageSize)
      .populate('owner', '-password');
  }

  async createProduct(productData, owner, imageURL) {
    const newProduct = await productModel.create({
      ...productData,
      owner,
      imageURL
    });
    return await newProduct.save();
  }

  async updateProduct(id, productData) {
    return await productModel
      .findByIdAndUpdate(id, productData, { returnDocument: 'after' })
      .populate('owner', '-password');
  }

  async deleteProduct(id) {
    return await productModel.findByIdAndDelete(id).populate('owner', '-password');
  }
}

export default new ProductsService();
