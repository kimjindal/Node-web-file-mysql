const template = require('../lib/expressModule'); // my process module

var list = '';
var title = '';
var content = '';
var loginStatus = `😹  <a href="/auth/login">login</a>`;

const authUser = {
  email: 'your@google.com',
  password: '4044',
  nickname: 'crane',
};

const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => {
  title = 'Login User Form';
  list = template.list(req.list);
  content = `
    <form action="/auth/loginProcess" method="post">
      <p><input type="text" name="email" pattern=".+@google\.com" size="20" placeholder="your@google.com" required /></p>
      <p><input type="password" name="password" pattern="[0-9]{4}" size="20" placeholder="your@password" required /></p>
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

router.post('/loginProcess', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email === authUser.email && password === authUser.password) {
    req.session.isLogin = true;
    req.session.nickname = authUser.nickname;
    req.session.save(function (err) {
      res.redirect('/');
    });
  } else {
    res.send('Sorry Sign in please!');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(function (err) {
    res.redirect('/');
  });
});

module.exports = router;
