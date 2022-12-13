const Sequelize = require('sequelize');

const database = require('../utils/database.js');
console.log(database)


module.exports = database.define('lup', {
    title: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    description: {
        type: Sequelize.TEXT('medium'),
        allowNull: false,
    },
    imageUrl: {
        type: Sequelize.STRING,
        allowNull: true,
    },
});