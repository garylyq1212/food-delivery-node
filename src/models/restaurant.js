'use strict';
const {
  Model
} = require('sequelize');
const VendorUser = require('./vendoruser');
module.exports = (sequelize, DataTypes) => {
  class Restaurant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.VendorUser, { foreignKey: 'vendorUserId', as: 'vendorUser' });
      this.hasMany(models.RestaurantFood, { foreignKey: 'restaurantId', as: 'foods' });
    }
  };

  Restaurant.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    address: DataTypes.STRING,
    restaurantImage: DataTypes.STRING,
    vendorUserId: {
      type: DataTypes.INTEGER,
      references: {
        model: VendorUser,
        key: 'id'
      },
      onUpdate: 'cascade',
    }
  }, {
    sequelize,
    modelName: 'Restaurant',
    tableName: 'restaurants',
  });

  return Restaurant;
};