import handler from 'express-async-handler';
import * as foodService from '../services/foodServices.js';

const getFoods = handler(async (req, res) => {
  const foods = await foodService.getAllFoods();
  res.json(foods);
});

const getFoodById = handler(async (req, res) => {
  const food = await foodService.getFoodById(req.params.id);
  if (!food) {
    res.status(404);
    throw new Error('Food item not found');
  }
  res.json(food);
});

const getCategories = handler(async (req, res) => {
  const categories = await foodService.getCategoriesWithCounts();
  res.json(categories);
});

const searchTerm = handler(async (req, res) => {
  const { searchTerm } = req.params;
  const foods = await foodService.searchFoodsByName(searchTerm);
  res.json(foods);
});

const category = handler(async (req, res) => {
  const { category } = req.params;
  const foods = await foodService.getFoodsByCategory(category);
  res.json(foods);
});

const createFood = handler(async (req, res) => {
  const createdFood = await foodService.createFoodItem(req.body);
  res.status(201).json(createdFood);
});

const updateFood = handler(async (req, res) => {
  const updatedFood = await foodService.updateFoodItem(req.params.id, req.body);
  res.json(updatedFood);
});

const deleteFood = handler(async (req, res) => {
  await foodService.deleteFoodItem(req.params.id);
  res.json({ message: 'Food item removed' });
});

export default {
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
  getCategories,
  searchTerm,
  category,
};
