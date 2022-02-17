const template = require('../lib/expressModule');
const express = require('express');
const router = express.Router();

var title = '';
var list = '';
var content = '';
var control = '';
var loginStatus = {};

router.get('/', (req, res) => {
  title = 'Welcome';
  list = template.list(req.list);
  content = '<p><div>Hello~ Node.js with Express!!!</p></div>';
  loginStatus = template.loginStatus(req);

  if (loginStatus.on) {
    control = `
     <div class="control">
       <a href="/topic/create">Create</a>
    </div>
    <style>
      .control {
        border: 1px solid #ccc;
        display: inline-flex;
        padding: 5px;
      }
    </style>`;
  } else {
    control = '';
  }

  var HTML = template.html(
    title,
    list,
    control,
    `<h2>${title}</h2><div>${content}</div><div><img src="./images/welcome.jpg"></div>`,
    loginStatus.tag
  );

  res.send(HTML);
});

module.exports = router;
