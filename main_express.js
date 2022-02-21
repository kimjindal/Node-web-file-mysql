const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
const session = require('express-session');
const FileStore = require('session-file-store')(session);

const app = express();
// Express Middleware: VERY important
// Security Http Header middleware
app.use(helmet());
// Static files serving middleware
app.use(express.static('public'));
// Between client and server of Body(form data) parseing middleware
app.use(bodyParser.urlencoded({ extended: false }));
// Use compression middleware
app.use(compression());
// Security cookie middleware stores session data on the server
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new FileStore({ logFn: function () {} }),
  })
);

// Authentication middleware Passport
const passport = require('./lib/passport')(app);
const string = encodeURIComponent('Please check your email and password');
app.post(
  '/auth/loginProcess',
  passport.authenticate('local', {
    // successRedirect:'/',
    failureRedirect: '/auth/login?flash=' + string,
  }),
  function (req, res) {
    req.session.save(function (err) {
      console.log('session save & successRedirect');
      res.redirect('/');
    });
  }
);

// Express Router: VERY Important
const index = require('./routes/index'); // my router module
const topic = require('./routes/topic'); // my router module
const auth = require('./routes/auth'); // my router module

// Create file list to <ul> tag of mine middleware
app.get('*', function (req, res, next) {
  fs.readdir('./data', function (err, filelist) {
    if (err) next(err);
    req.list = filelist;
    next();
  });
});

app.use('/', index);
app.use('/topic', topic);
app.use('/auth', auth);

// Error handlers
app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find your page!");
});
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broken!');
});

app.listen(3000);
