const fs = require('fs');
const pathParse = require('path-parse');
const sanitizeHtml = require('sanitize-html');
const cookie = require('cookie');

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
        ${list}
        ${control}
        ${body}
      </body>
      </html>
    `;
  },

  list: function (files) {
    var arr = [
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
    var tag = '';
    tag = '<ul>';
    var i = 0;
    while (i < files.length) {
      let index = arr.indexOf(files[i]);
      if (index === -1) {
        tag = tag + `<li><a href="/?title=${files[i]}">${files[i]}</a></li>`;
      }
      i = i + 1;
    }
    tag = tag + '</ul>';
    return tag;
  },

  addProcess: function (req, res) {
    var body = '';
    req.on('data', function (data) {
      body += data;
    });
    req.on('end', function () {
      let id;
      let post = new URLSearchParams(body);
      title = sanitizeHtml(post.get('title')); // very very important!!
      content = sanitizeHtml(post.get('description'));

      id = post.get('id');
      if (id) {
        fs.rename(`data/${id}`, `data/${title}`, () => {
          fs.writeFile(`data/${title}`, content, 'utf8', function () {
            res.writeHead(301, { Location: `/?title=${title}` });
            res.end();
          });
        });
      } else {
        fs.writeFile(`data/${title}`, content, 'utf8', function () {
          res.writeHead(301, { Location: `/?title=${title}` });
          res.end();
        });
      }
    });
  },

  deleteProcess: function (req, res) {
    var body = '';
    req.on('data', function (data) {
      body += data;
    });
    req.on('end', function () {
      let post = new URLSearchParams(body);
      let id = post.get('id');
      if (id === 'Welcome') id = '';
      const parsePath = pathParse(id).base; // very very important!!
      fs.unlink(`data/${parsePath}`, () => {
        res.writeHead(301, { Location: '/' });
        res.end();
      });
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
         <a href="/add">Create</a>
         <a href="/update?title=${title}">Update</a>
         <form action="deleteProcess" method="post">
           <input type="hidden" name="id" value="${title}" />
           <input type="submit" value="Delete" onclick="return confirm('Are you sure you want to Delete?')"/>
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
