const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });

const env = process.env.NODE_ENV || 'development';

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "food_delivery_node",
    host: "127.0.0.1",
    dialect: "mysql",
    db_port: process.env.DB_PORT,
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "food_delivery_node",
    host: "127.0.0.1",
    dialect: "mysql",
    db_port: process.env.DB_PORT,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB,
    host: process.env.DB_HOST,
    dialect: "mysql",
    db_port: process.env.DB_PORT,
  }
}[env];
