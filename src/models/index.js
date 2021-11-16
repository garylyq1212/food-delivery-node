'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);

const config = require(__dirname + '/../config/config.js');
const db = {};

const options = {
    host: config.host,
    dialect: config.dialect,
    port: config.db_port,
    timezone: "+08:00"
}

let sequelize;
if (process.env.NODE_ENV !== 'production') {
    sequelize = new Sequelize(config.database, config.username, config.password, options);
} else {
    sequelize = new Sequelize(config.database, config.username, config.password, {
        ...options,
        ssl: true,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        }
    });

    // sequelize = new Sequelize(process.env.DATABASE_URL, {
    //     ssl: true,
    //     dialectOptions: {
    //         ssl: {
    //             require: true,
    //             rejectUnauthorized: false,
    //         },
    //     }
    // });
    // sequelize = new Sequelize(process.env.DATABASE_URL);
    // console.log(sequelize);
}

fs
    .readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
