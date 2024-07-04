import express from 'express';
import FoodController from './controllers/FoodController';

const foodRouter = express.Router();

foodRouter.get('/menu', FoodController.getAllItems);
foodRouter.get('/menu/:id', FoodController.getItem);
foodRouter.get('/category/:category', FoodController.getItemsByCategory);
foodRouter.get('/categories', FoodController.getCategories);

export default router;