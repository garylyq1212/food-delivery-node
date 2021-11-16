const express = require('express');

const {
  getFoods,
  createFood,
  showFood,
  updateFood,
  deleteFood
} = require('../controllers/restaurantFoods.controller');
const { protect, findRestaurant } = require('../middlewares');

const router = express.Router({ mergeParams: true });

router.get('/', protect, findRestaurant, getFoods);
router.post('/', protect, findRestaurant, createFood);
router.get('/:id', protect, findRestaurant, showFood);
router.put('/:id', protect, findRestaurant, updateFood);
router.delete('/:id', protect, findRestaurant, deleteFood);

module.exports = router;