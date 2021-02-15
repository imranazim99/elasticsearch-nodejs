const sequelize = require('../../config/dbconfig');
var Sequelize = require('sequelize');

  var products = sequelize.define("products", {
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
        type: Sequelize.STRING
      },
    is_delete: {
      type: Sequelize.INTEGER,
      defaultValue: 1
    }
  });

module.exports = products;