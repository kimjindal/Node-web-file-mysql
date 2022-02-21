const fs = require('fs');
const template = require('../lib/expressModule'); // my process module

const express = require('express');
const router = express.Router();

var list = '';
var title = '';
var content = '';
var control = '';
var loginStatus = {};

router.get('/create', (req, res) => {
  title = 'Create a article';
  list = template.list(req.list);
  loginStatus = template.loginStatus(req.user);

  content = `
    <form action="/topic/createProcess" method="post">
      <p><input type="text" name="title" placeholder="title" /></p>
      <p><textarea name="description" placeholder="description..."></textarea></p>
      <p><input type="submit" /></p>
    </form>
    `;

  var HTML = template.html(
    title,
    list,
    '',
    `<h2>${title}</h2><div>${content}</div>`,
    loginStatus.tag
  );

  res.send(HTML);
});

router.get('/:pageId', (req, res, next) => {
  fs.readFile(`data/${req.params.pageId}`, 'utf8', (err, content) => {
    if (err) {
      next(err);
      return false;
    }

    title = req.params.pageId;
    list = template.list(req.list);
    loginStatus = template.loginStatus(req.user);

    if (loginStatus.on) {
      control = template.controlForm(title);
    } else {
      control = '';
    }

    var HTML = template.html(
      title,
      list,
      control,
      `<h2>${title}</h2><div>${content}</div>`,
      loginStatus.tag
    );

    res.send(HTML);
  });
});

router.get('/update/:pageId', (req, res) => {
  fs.readFile(`data/${req.params.pageId}`, 'utf8', (err, content, next) => {
    if (err) {
      next(err);
      return false;
    }
    title = req.params.pageId;
    list = template.list(req.list);
    loginStatus = template.loginStatus(req.user);

    if (loginStatus.on) {
      control = template.controlForm(title);
    } else {
      control = '';
    }

    var HTML = template.html(
      title,
      list,
      control,
      `<h2>Update</h2>
      <form action="/topic/updateProcess" method="post">
        <p><input type="hidden" name="id" value="${title}"/></p>
        <p><input type="text" name="title" placeholder="title" value="${title}"/></p>
        <p><textarea name="description" placeholder="description...">${content}</textarea></p>
        <p><input type="submit" /></p>
      </form>
      `,
      loginStatus.tag
    );

    res.send(HTML);
  });
});

router.post('/createProcess', (req, res) => {
  loginStatus = template.loginStatus(req.user);
  if (!loginStatus.on) {
    res.send("Sorry! You can't create a article.");
    return false;
  }
  template.createProcess(req, res);
});

router.post('/updateProcess', (req, res) => {
  loginStatus = template.loginStatus(req.user);
  if (!loginStatus.on) {
    res.send("Sorry! You can't update a article.");
    return false;
  }
  template.createProcess(req, res);
});

router.post('/deleteProcess', (req, res) => {
  loginStatus = template.loginStatus(req.user);
  if (!loginStatus.on) {
    res.send("Sorry! You can't delete a article.");
    return false;
  }
  template.deleteProcess(req, res);
});

module.exports = router;
