const fs = require('fs');
const bodyParser = require('body-parser');
const compression = require('compression');
const topic = require('./routes/topic'); // my router module
const index = require('./routes/index'); // my router module

const express = require('express');
const app = express();

// Express Middleware :VERY important
// Static files serving middleware
app.use(express.static('public'));
// Between client and server of Body(form data) parseing middleware
app.use(bodyParser.urlencoded({ extended: false }));
// Use compression middleware
app.use(compression());
// Create file list to <ul> tag of mine middleware
app.get('*', function (req, res, next) {
  fs.readdir('./data', function (err, filelist) {
    if (err) next(err);
    req.list = filelist;
    next();
  });
});

// Express Router
app.use('/', index);
app.use('/topic', topic);

// Error handlers
app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find your page!");
});
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broken!');
});

app.listen(3000);
