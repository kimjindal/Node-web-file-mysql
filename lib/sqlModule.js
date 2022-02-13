const fs = require('fs');
const _path = require('path');
const sanitizeHtml = require('sanitize-html');

var M = {
  html: function (title, list, body, author, control) {
    return `
      <!doctype html>
      <html>
      <head>
        <title>WEB1 - ${title}</title>
        <meta charset="utf-8">
      </head>
      <body>
        <h1><a href="/">WEB</a></h1>
        <a href="/author">Author</a>
        ${list}
        ${control}
        <h2>${title}</h2>
        ${body}
        ${author}
      </body>
      </html>
    `;
  },

  list: function (files) {
    var arr = ['WELCOME', 'addForm', 'addProcess', 'update', 'updateProcess', 'deleteProcess'];
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

  topicList: function (topics) {
    var tag = '';
    topics.forEach((topic) => {
      tag += `<li><a href="/?id=${topic.id}">${topic.title}</a></li>`;
    });
    return `<ul>${tag}</ul>`;
  },

  authorList: function (authors, authorId) {
    let tag = '';
    authors.forEach((author) => {
      if (authorId === author.id) {
        tag += `<option value="${author.id}" selected>${author.name}</option>`;
      } else {
        tag += `<option value="${author.id}">${author.name}</option>`;
      }
    });
    return `<select name="authorId">${tag}</select>`;
  },

  authorTable: function (authors) {
    let tag = '<tr><td>name</td><td>profile</td><td>update</td><td>delete</td></tr>';
    authors.forEach((author) => {
      tag += `
        <tr>
          <td>${author.name}</td>
          <td>${author.profile}</td>
          <td><a href="/author/update?id=${author.id}">update</a></td>
          <td>
            <form method="post" action="/author/deleteProcess">
              <input type="hidden" name="id" value="${author.id}">
              <input type="submit" value="delete">
            </form>
          </td>
        </tr>
      `;
    });
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
      const parsePath = _path.parse(id).base; // very very important!!
      fs.unlink(`data/${parsePath}`, () => {
        res.writeHead(301, { Location: '/' });
        res.end();
      });
    });
  },
};

module.exports = M;
