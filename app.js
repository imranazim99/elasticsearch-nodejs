var createError = require('http-errors'),
    express = require('express'),
    cookieParser = require('cookie-parser'),
    logger = require('morgan'),
    fileUpload = require('express-fileupload'),
    bodyParser = require('body-parser'),
    path = require('path'),
    session = require('express-session'),
    flash = require('express-flash'),
    passport = require("passport"),
    LocalStrategy = require("passport-local").Strategy,
    env=require('dotenv'),
    User = require("./models/ap/user"),
    Role = require("./models/ap/role"),
    fs = require('fs'),
    apRouter = require('./routes/ap/routing');
var app = express();
var http = require('http').Server(app);

// Express session
app.use(session({
  secret: "insideNow112233",
  resave: false,
  saveUninitialized: false,
  cookie  : { maxAge  : 30 * 24 * 60 * 60 * 1000 }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


//serialize
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id).then((user) => {
    done(null, user);
  }).catch(done);
});
passport.use(new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
  User.findOne({
    where: { username: username },
    include: [{
      model: Role,
      as: 'roles'
    }]
  }).then((user) => {
    if (!user) {
      return done(null, false, { message: `Username ${username} not found.` });
    }
    user.comparePassword(password, (err, isMatch) => {
      if (err) { 
        return done(null, false, {message: err}); 
      }
      if (isMatch) {
        return done(null, user);
      } else if(!isMatch) {
        return done(null, false, {message: 'Your password is invalid.'});
      }
    });
  });
}));
app.use(function (req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  res.locals.currentUser = req.user;
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Tell the bodyparser middleware to accept more data
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// configure express to use public folder
// Static Files
app.use(express.static('public'));
app.use('/ap', express.static(__dirname + 'public/ap'))
app.use('/site', express.static(__dirname + 'public/site'))

app.use(express.static(__dirname + '/static'));

app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(fileUpload()); // configure fileupload

// app.use(router);
app.use(apRouter)

// app.use('/secured', jwtVerify, securedRoutes)

// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('ap/error', {title: "Error!"});
// });
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
// app.use( function check(){
//   checkJwtToken(req, res)
// })

// set the app to listen on the port
const port = (process.env.PORT || "9002");
var server = http.listen(port, () => {
    console.log('server is running on port', server.address().port);
  });