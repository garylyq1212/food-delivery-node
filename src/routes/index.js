const auth = require('./auth.route');
const restaurants = require('./restaurants.route');
const restaurantFoods = require('./restaurantFoods.route');

module.exports = {
  restaurants,
  auth,
  restaurantFoods,
};