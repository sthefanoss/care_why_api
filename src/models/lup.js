const Sequelize = require('sequelize');

const database = require('../utils/database');

module.exports = database.define('lup', {
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    description:{
        type: Sequelize.TEXT('medium'),
        allowNull: false,
    },
    imageUrl:{
        type: Sequelize.STRING,
        allowNull: true,
    },
});