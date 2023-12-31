const { Sequelize, DataTypes, Model, Op } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USERNAME, process.env.DATABASE_PASSWORD, {
    dialect: 'mariadb',
    host: process.env.DATABASE_HOST,
    dialectOptions: {
        // Options ...
    }
});


module.exports = {
    sequelize,
    DataTypes,
    Model,
    Op
}