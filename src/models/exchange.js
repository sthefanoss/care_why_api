const Sequelize = require('sequelize');

const database = require('../utils/database');

module.exports = database.define('exchange', {
    reason: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    coins: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
});