const express = require('express');
const router = express.Router();
const template = require('../lib/expressModule'); // my process module
const db = require('../lib/lowdb');
const { v4 } = require('uuid');

var list = '';
var title = '';
var content = '';
var flashmsg = '';
var loginStatus = `<a href="/auth/login">login</a> | <a href="/auth/register">register</a>`;

router.get('/login', (req, res) => {
  if (req.query.flash) flashmsg = req.query.flash;
  title = 'Login User Form';
  list = template.list(req.list);
  content = `
    <form action="/auth/loginProcess" method="post">
      <p><span style="color:red;">${flashmsg}</span></p>
      <p><input type="text" name="email" pattern=".+@gmail\.com" size="20" placeholder="your@gmail.com" required /></p>
      <p><input type="password" name="password" pattern="[0-9]{4}" size="20" placeholder="your password" required /></p>
      <p><input type="submit" /></p>
    </form>
    `;
  var HTML = template.html(
    title,
    list,
    `<h2>${title}</h2><div>${content}</div>`,
    '',
    loginStatus
  );

  res.send(HTML);
});

router.get('/logout', (req, res) => {
  req.logout();

  // req.session.destroy
  req.session.save(function (err) {
    res.redirect('/');
  });
});

router.get('/register', (req, res) => {
  if (req.query.flash) flashmsg = req.query.flash;
  title = 'Register User Form';
  list = template.list(req.list);
  content = `
    <form action="/auth/registerProcess" method="post">
      <p><span style="color:red;">${flashmsg}</span></p>
      <p><input type="text" name="email" pattern=".+@gmail\.com" size="20" placeholder="your@gmail.com" required /></p>
      <p><input type="password" name="password" pattern="[0-9]{4}" size="20" placeholder="your password" required /></p>
      <p><input type="password" name="password2" pattern="[0-9]{4}" size="20" placeholder="your password repeat" required /></p>
      <p><input type="text" name="displayname" maxlength="10" size="20" placeholder="your nickname" required /></p>
      <p><input type="submit" /></p>
    </form>
    `;
  var HTML = template.html(
    title,
    list,
    `<h2>${title}</h2><div>${content}</div>`,
    '',
    loginStatus
  );

  res.send(HTML);
});

router.post('/registerProcess', function (req, res) {
  const post = req.body;
  const id = v4();
  const email = post.email;
  const password = post.password;
  const password2 = post.password2;
  const displayname = post.displayname;
  if (password !== password2) {
    const string = encodeURIComponent('Your password must same!');
    res.redirect('/auth/register?flash=' + string);
  } else {
    const user = {
      id: id,
      email: email,
      password: password,
      displayname: displayname,
    };
    db.get('users').push(user).write();
    req.login(user, function (err) {
      return res.redirect('/');
    });
  }
});

module.exports = router;
