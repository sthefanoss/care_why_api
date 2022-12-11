const Sequelize = require('sequelize');

const database = require('../utils/database');

module.exports = database.define('user', {
    // id: {
    //     type: Sequelize.INTEGER,
    //     autoIncrement: true,
    //     allowNull: false,
    //     primaryKey: true,
    // },
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
});