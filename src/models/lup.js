const Sequelize = require('sequelize');

const database = require('../utils/database.js');
console.log(database)


module.exports = database.define('lup', {
    title: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    typeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    imageUrl: {
        type: Sequelize.STRING,
        allowNull: true,
    },
});