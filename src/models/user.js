const Sequelize = require('sequelize');

const database = require('../utils/database');

module.exports = database.define('user', {
    username: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    coins: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    isAdmin: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    isManager: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    nickname: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    imageUrl: {
        type: Sequelize.STRING,
        allowNull: true,
    },
}, {
    defaultScope: {
        attributes: { exclude: ['password'] },
    },
    scopes: {
        withPassword: {},
    }
});