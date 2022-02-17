const express = require('express');
const app = express();

const fs = require('fs');
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
const session = require('express-session');
const FileStore = require('session-file-store')(session);

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
// Create file list to <ul> tag of mine middleware
app.get('*', function (req, res, next) {
  fs.readdir('./data', function (err, filelist) {
    if (err) next(err);
    req.list = filelist;
    next();
  });
});

// Express Router: VERY Important
const index = require('./routes/index'); // my router module
const topic = require('./routes/topic'); // my router module
const auth = require('./routes/auth'); // my router module

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
