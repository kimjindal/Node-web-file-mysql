const fs = require('fs');
const pathParse = require('path-parse');
const sanitizeHtml = require('sanitize-html');
const cookie = require('cookie');

var arrFiles = [
  'Welcome',
  'addForm',
  'addProcess',
  'update',
  'updateProcess',
  'deleteProcess',
  'loginForm',
  'loginProcess',
  'logoutProcess',
];

var M = {
  html: function (title, list, body, control, loginStatus) {
    return `
      <!doctype html>
      <html>
      <link rel="shortcut icon" href="#">
      <head>
        <title>WEB1 - ${title}</title>
        <meta charset="utf-8">
      </head>
      <body>
        ${loginStatus}
        <h1><a href="/">WEB</a></h1>
        <div>${list}</div>
        ${control}
        ${body}
      </body>
      </html>
    `;
  },

  list: function (filelist) {
    var tag = '';
    tag = '<ul>';
    var i = 0;
    while (i < filelist.length) {
      let index = arrFiles.indexOf(filelist[i]);
      if (index === -1) {
        tag = tag + `<li><a href="/topic/${filelist[i]}">${filelist[i]}</a></li>`;
      }
      i = i + 1;
    }
    tag = tag + '</ul>';
    return tag;
  },

  createProcess: function (req, res) {
    // Node.js body parsing by body-parser middleware
    var post = req.body;
    title = sanitizeHtml(post.title);
    content = sanitizeHtml(post.description, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    });

    id = post.id;
    if (id) {
      fs.rename(`data/${id}`, `data/${title}`, () => {
        fs.writeFile(`data/${title}`, content, 'utf8', function () {
          res.redirect(`/topic/${title}`);
        });
      });
    } else {
      fs.writeFile(`data/${title}`, content, 'utf8', function () {
        res.redirect(`/topic/${title}`);
      });
    }
  },

  deleteProcess: function (req, res) {
    let post = req.body;
    let id = post.id;
    if (id === 'Welcome') id = '';
    const parsePath = pathParse(id).base; // VERY important!!
    fs.unlink(`data/${parsePath}`, () => {
      res.redirect('/'); // express redirection
    });
  },

  loginProcess: function (req, res) {
    var body = '';
    req.on('data', function (data) {
      body += data;
    });
    req.on('end', function () {
      let post = new URLSearchParams(body);
      let email = sanitizeHtml(post.get('email'));
      if (email === 'your@google.com') {
        res.writeHead(302, {
          'Set-Cookie': ['login=ok;Max-Age=60*60;Path=/'],
          'Content-Type': 'text/plain',
          Location: '/',
        });
      }
      res.end('Your login is rejected!');
    });
  },

  loginAuth: function (req) {
    let cookies = {};
    let auth = {};
    if (req.headers.cookie) {
      cookies = cookie.parse(req.headers.cookie);
    }
    if (cookies.login === 'ok') {
      auth.loginOK = true;
      auth.loginStatus = '<a href="/logout?title=">logout</a>';
    } else {
      auth.loginOK = false;
      auth.loginStatus = '<a href="/login">login</a>';
    }
    return auth;
  },

  logoutProcess: function (res) {
    // To delete cookie, set Head 302?
    res.writeHead(302, {
      'Set-Cookie': ['login=;Max-Age=0;Path=/'],
      'Content-Type': 'text/plain',
      Location: '/',
    });
    res.end('You are logout, Thank you~');
  },

  controlForm: function (title) {
    return `
      <div class="control">
         <a href="create">Create</a>
         <a href="update/${title}">Update</a>
         <form action="/topic/deleteProcess" method="post">
           <input type="hidden" name="id" value="${title}" />
           <input type="submit" value="delete" onclick="return confirm('Are you sure you want to Delete?')"/>
         </form>
      </div>
      <style>
        .control {
          border: 1px solid #ccc;
          display: inline-flex;
          padding: 5px;
        }
        a {
          padding-right:10px;
        }
      </style>
    `;
  },
};

module.exports = M;
