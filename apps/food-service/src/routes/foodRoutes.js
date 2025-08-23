import {Router } from 'express';
import foodController from '../controllers/foodController.js';

const router = Router();

// Public endpoints
router.route('/').get(foodController.getFoods);
router.route('/category/:category').get(foodController.category);
router.route('/search/:searchTerm').get(foodController.searchTerm);
router.route('/categories').get(foodController.getCategories);
router.route('/:id').get(foodController.getFoodById);
// Admin-protected endpoints (authorization middleware to be added later)
router.route('/').post(foodController.createFood);
router.route('/:id').put(foodController.updateFood);
router.route('/:id').delete(foodController.deleteFood);

export default router;
