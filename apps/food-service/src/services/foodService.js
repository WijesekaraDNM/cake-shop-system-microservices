import { foodModel } from '../models/foodModel.js';

export const getAllFoods = async () => {
  return await foodModel.find({});
};

export const getFoodById = async (id) => {
  return await foodModel.findById(id);
};

export const getCategoriesWithCounts = async () => {
  const categories = await foodModel.aggregate([
    { $match: { category: { $exists: true, $ne: null } } },  // optional: 
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $project: { _id: 0, name: '$_id', count: '$count' } },
  ]).sort({ count: -1 });

  const all = {
    name: 'All',
    count: await foodModel.countDocuments(),
  };

  categories.unshift(all);
  return categories;
};

export const searchFoodsByName = async (searchTerm) => {
  const regex = new RegExp(searchTerm, 'i');
  return await foodModel.find({ name: { $regex: regex } });
};

export const getFoodsByCategory = async (category) => {
  return await foodModel.find({ category });
};

export const createFoodItem = async (foodData) => {
  console.log("create :", foodData)
  const food = new foodModel(foodData);
  return await food.save();
};

export const updateFoodItem = async (id, updateData) => {
  const food = await foodModel.findById(id);
  if (!food) throw new Error('Food item not found');
  Object.assign(food, updateData);
  return await food.save();
};

export const deleteFoodItem = async (id) => {
  const result = await foodModel.deleteOne({ _id: id });
  if (result.deletedCount === 0) {
    throw new Error('Food item not found');
  }
  return result;
};

