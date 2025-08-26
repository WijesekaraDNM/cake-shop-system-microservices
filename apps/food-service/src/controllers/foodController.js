import handler from 'express-async-handler';
import * as foodService from '../services/foodService.js';
import { foodModel } from '../models/foodModel.js';

const getFoods = handler(async (req, res) => {
  const foods = await foodService.getAllFoods();
  console.log(foods)
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
  console.log(categories)
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
  const { name, description, price, imageData, category, available } = req.body;
  console.log("Request body: ", req.body);
  try {
    const replacedStr = imageData.replace(/^data:image\/\w+;base64,/, '');
    const imageDataStr = Buffer.from(replacedStr, 'base64');


    console.log("Image str: ", imageDataStr);
    const food = new foodModel({
      name,
      description,
      price,
      imageData: imageDataStr,
      category,
      available,
    });

    
    console.log("cake created :", food);
    const createdFood = await foodService.createFoodItem(food);
    console.log("createdCake :", createFood);
    res.status(201).json(createdFood);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create food item', error });
  }
  
});

const updateFood = handler(async (req, res) => {
   try {
    const { imageData, ...updateFields } = req.body;
    if (imageData) {
      // Convert base64 image string to Buffer
      const replacedStr = imageData.replace(/^data:image\/\w+;base64,/, '');
      updateFields.imageData = Buffer.from(replacedStr, 'base64');
    }
    const updatedFood = await foodService.updateFoodItem(req.params.id, updateFields);
    res.json(updatedFood);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update food item', error });
  }
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
