const sequelize = require('../../config/dbconfig');
var Sequelize = require('sequelize');
var bcrypt = require("bcryptjs");
var Role = require("../../models/ap/role");

  var users = sequelize.define("users", {
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING
    },
    contactNo: {
        type: Sequelize.STRING,
        allowNull: true
    },
    image: {
        type: Sequelize.STRING,
        allowNull: true
    },
    // male,female
    gender: {
        type: Sequelize.STRING,
        allowNull: true
      },
    role_id: {
        type: Sequelize.INTEGER
    },
    is_delete: {
        type: Sequelize.INTEGER,
        defaultValue: '1'
    },
    token:{
      type:Sequelize.STRING,
      defaultValue:null
    },
    resetToken:{
      type:Sequelize.STRING,
      defaultValue:null
    }
  });

  users.beforeSave((user) => {
    if (user.changed('password')) {
        user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
    }
    
});
users.prototype.comparePassword = function (password, cb) {
    bcrypt.compare(password, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};
users.belongsTo(Role, { as: 'roles', foreignKey: 'role_id' });

module.exports = users;