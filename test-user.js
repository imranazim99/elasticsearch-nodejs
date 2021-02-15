var host = "localhost";

var port = "9006";
var url = require("url"),
    express = require("express"),
    path = require("path"),
    passport = require('passport'),
    LocalStrategy = require("passport-local"),
    Role = require("./models/ap/role"),
    User = require("./models/ap/user"),
    bodyParser = require("body-parser"),
    app = express();

// ========================= create user ========================
Role.create({
    title: "Admin",
    permission: "admin"
}).then(function(role) {
    User.create({
        username: "imranazim99@gmail.com",
        password: "123",
        name: "Imran Azim",
        gender: "male",
        contactNo: "03005858958",
        image: "/ap/images/admin-avatar.png",
        role_id: role.id
    }).then(function (user) {
        console.log(user);
    }).catch(function (err) {
        console.log(err);
    });
}).then(function(err) {
    console.log(err);
})


