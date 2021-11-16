const express = require('express');

const {
  getRestaurants,
  showRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = require('../controllers/restaurants.controller');
const restaurantFoods = require('./restaurantFoods.route');
const { protect, vendorRolesAuthorize } = require('../middlewares');

const router = express.Router();

// router
//   .route('/')
//   .get(getRestaurants)
//   .post(createRestaurant);

// router
//   .route('/:id')
//   .get(showRestaurant)
//   .put(updateRestaurant)
//   .delete(deleteRestaurant);

router.get('/', protect, getRestaurants);
router.post('/', protect, vendorRolesAuthorize('admin', 'owner'), createRestaurant);
router.get('/:id', protect, showRestaurant);
router.put('/:id', protect, vendorRolesAuthorize('admin', 'owner'), updateRestaurant);
router.delete('/:id', protect, vendorRolesAuthorize('admin', 'owner'), deleteRestaurant);

// Food routes
router.use('/:restaurantId/foods', restaurantFoods);

module.exports = router;