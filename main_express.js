const fs = require('fs');
const express = require('express');
const req = require('express/lib/request');
const bodyParser = require('body-parser');
const compression = require('compression');
const template = require('./lib/expressModule');

const app = express();

var list = '';
var title = '';
var content = '';
var control = '';
var loginStatus = '';

// Express Middleware :VERY important
// Serving static files in Express
app.use(express.static('public'));
// Between Webclient and Server of Form data parseing by express middleware
app.use(bodyParser.urlencoded({ extended: false }));
// Use compression express middleware
app.use(compression());
// Create file list to <ul> tag by writted to my express middleware
app.get('*', function (req, res, next) {
  fs.readdir('./data', function (err, filelist) {
    if (err) next(err);
    req.list = filelist;
    next();
  });
});

app.get('/', (req, res) => {
  title = 'Welcome';
  list = template.list(req.list);
  control = template.controlForm('');
  content = '<p><div>Hello~ Node.js with Express!!!</p></div>';
  var HTML = template.html(
    title,
    list,
    `<h2>${title}</h2><div>${content}</div><div><img src="./images/unsplash_html.jpg"></div>`,
    control,
    loginStatus
  );

  res.send(HTML);
});

app.get('/page/:pageId', (req, res, next) => {
  fs.readFile(`data/${req.params.pageId}`, 'utf8', (err, content) => {
    if (err) next(err);
    // if (err) content = `Sorry can't this page!`;
    title = req.params.pageId;
    list = template.list(req.list);
    control = template.controlForm(title);

    var HTML = template.html(
      title,
      list,
      `<h2>${title}</h2><div>${content}</div>`,
      control,
      loginStatus
    );

    res.send(HTML);
  });
});

app.get('/create', (req, res) => {
  title = 'Create a article';
  list = template.list(req.list);
  content = `
    <form action="/createProcess" method="post">
      <p><input type="text" name="title" placeholder="title" /></p>
      <p><textarea name="description" placeholder="description..."></textarea></p>
      <p><input type="submit" /></p>
    </form>
    `;
  var HTML = template.html(title, list, `<h2>${title}</h2><div>${content}</div>`, '', loginStatus);

  res.send(HTML);
});

app.post('/createProcess', (req, res) => {
  template.createProcess(req, res);
});

app.get('/update/:pageId', (req, res) => {
  fs.readFile(`data/${req.params.pageId}`, 'utf8', (err, content) => {
    title = req.params.pageId;
    list = template.list(req.list);
    var HTML = template.html(
      title,
      list,
      `<h2>Update</h2>
      <form action="/updateProcess" method="post">
        <p><input type="hidden" name="id" value="${title}"/></p>
        <p><input type="text" name="title" placeholder="title" value="${title}"/></p>
        <p><textarea name="description" placeholder="description...">${content}</textarea></p>
        <p><input type="submit" /></p>
      </form>
      `,
      '',
      loginStatus
    );

    res.send(HTML);
  });
});

app.post('/updateProcess', (req, res) => {
  template.createProcess(req, res);
});

app.post('/deleteProcess', (req, res) => {
  template.deleteProcess(req, res);
});

// Error handlers
app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find your page!");
});
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(3000);
