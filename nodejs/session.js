var parseurl = require('parseurl');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var fileStoreOptions = {
  path: './sessions',
};

var helmet = require('helmet');
var express = require('express');
var app = express();

app.use(helmet());

app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: new FileStore(fileStoreOptions),
  })
);

app.use(function (req, res, next) {
  if (!req.session.views) {
    req.session.views = {};
  }
  var pathname = parseurl(req).pathname;
  req.session.views[pathname] = (req.session.views[pathname] || 0) + 1;
  next();
});

app.get('/', function (req, res, next) {
  console.log(req.session);
  res.send('Hello~ Session [root] ' + req.session.views['/'] + ' times');
});

app.listen(3000);
