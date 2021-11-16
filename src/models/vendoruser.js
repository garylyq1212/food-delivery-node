'use strict';

const {
  Model
} = require('sequelize');

const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Restaurant = require('./restaurant');

module.exports = (sequelize, DataTypes) => {
  class VendorUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    getSignedJwtToken() {
      return jwt.sign({ id: this.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
    }

    async matchPassword(password) {
      return await bcryptjs.compare(password, this.password);
    }
  };

  VendorUser.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    profileImage: DataTypes.STRING,
    role: DataTypes.ENUM('admin', 'owner', 'user'),
    resetPasswordToken: DataTypes.STRING,
    resetPasswordExpire: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'VendorUser',
    tableName: 'vendor_users',
  });

  VendorUser.addHook('beforeCreate', async (vendorUser, options) => {
    const salt = await bcryptjs.genSalt(10);
    vendorUser.password = await bcryptjs.hash(vendorUser.password, salt);
  });

  // VendorUser.hasMany(Restaurant);

  return VendorUser;
};