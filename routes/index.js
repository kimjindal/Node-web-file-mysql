const template = require('../lib/expressModule');

const express = require('express');
const router = express.Router();

var title = '';
var list = '';
var content = '';

router.get('/', (req, res) => {
  title = 'Welcome';
  list = template.list(req.list);
  content = '<p><div>Hello~ Node.js with Express!!!</p></div>';
  var HTML = template.html(
    title,
    list,
    `<h2>${title}</h2><div>${content}</div><div><img src="./images/unsplash_html.jpg"></div>`,
    `<div class="control">
       <a href="/topic/create">Create</a>
    </div>
    <style>
      .control {
        border: 1px solid #ccc;
        display: inline-flex;
        padding: 5px;
      }
    </style>`,
    ''
  );

  res.send(HTML);
});

module.exports = router;
