const express = require('express');
const router = express.Router();
const fs = require('fs');
const template = require('../lib/expressModule'); // my process module

var list = '';
var title = '';
var content = '';
var control = '';
var loginStatus = '';

router.get('/create', (req, res) => {
  title = 'Create a article';
  list = template.list(req.list);
  content = `
    <form action="/topic/createProcess" method="post">
      <p><input type="text" name="title" placeholder="title" /></p>
      <p><textarea name="description" placeholder="description..."></textarea></p>
      <p><input type="submit" /></p>
    </form>
    `;
  var HTML = template.html(title, list, `<h2>${title}</h2><div>${content}</div>`, '', loginStatus);

  res.send(HTML);
});

router.get('/:pageId', (req, res, next) => {
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

router.get('/update/:pageId', (req, res) => {
  fs.readFile(`data/${req.params.pageId}`, 'utf8', (err, content, next) => {
    if (err) next(err);
    title = req.params.pageId;
    list = template.list(req.list);
    var HTML = template.html(
      title,
      list,
      `<h2>Update</h2>
      <form action="/topic/updateProcess" method="post">
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

router.post('/createProcess', (req, res) => {
  template.createProcess(req, res);
});

router.post('/updateProcess', (req, res) => {
  template.createProcess(req, res);
});

router.post('/deleteProcess', (req, res) => {
  template.deleteProcess(req, res);
});

module.exports = router;
