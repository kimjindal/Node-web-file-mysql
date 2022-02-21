const fs = require('fs');
const pathParse = require('path-parse');
const sanitizeHtml = require('sanitize-html');

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
  html: function (title, list, control, body, loginStatus) {
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
        tag =
          tag + `<li><a href="/topic/${filelist[i]}">${filelist[i]}</a></li>`;
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
      res.redirect('/'); // express edirection
    });
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

  loginStatus: function (user) {
    let status = {};

    status.tag =
      '<a href="/auth/login">login</a> | <a href="/auth/register">register</a> | <a href="/auth/google">login with google</a>';
    status.on = false;

    if (user) {
      status.tag = `${user.displayname} | <a href="/auth/logout">logout</a>`;
      status.on = true;
    }

    return status;
  },
};

module.exports = M;
