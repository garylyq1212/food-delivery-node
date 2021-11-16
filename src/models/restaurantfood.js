'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RestaurantFood extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });
    }
  };
  RestaurantFood.init({
    name: DataTypes.STRING,
    price: DataTypes.DECIMAL(10, 2),
    description: DataTypes.STRING,
    // restaurantId: {
    //   type: DataTypes.INTEGER,
    //   references: {
    //     model: 'restaurants',
    //     key: 'id',
    //   },
    //   onUpdate: 'cascade',
    //   onDelete: 'cascade',
    // },
    foodImage: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'RestaurantFood',
    tableName: 'restaurant_foods',
  });
  return RestaurantFood;
};