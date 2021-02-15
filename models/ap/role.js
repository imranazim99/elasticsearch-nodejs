
const sequelize = require('../../config/dbconfig');
var Sequelize = require('sequelize');

  var roles = sequelize.define("roles", {
    title: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    permission: {
      type: Sequelize.ENUM,
      values: ['admin','guest','disabled'],
      defaultValue: 'disabled'
    },
    is_delete: {
      type: Sequelize.INTEGER,
      defaultValue: '1'
    }
  });

module.exports = roles;