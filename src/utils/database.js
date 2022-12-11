const Sequelize = require("sequelize");

const database = new Sequelize(
  'carewhyapp',
  'carewhyapp',
  'fooboo123',
  {
    host: 'mysql.carewhyapp.kinghost.net',
    dialect: 'mysql'
  }
);



module.exports = database;