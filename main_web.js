const http = require('http');
const fs = require('fs');
const _path = require('path');
// The querystring API has been deprecated.
// New code should use the URLSearchParams API instead.
// var qs = require('querystring');
// const url = require('url');
const template = require('./lib/myModule');

var app = http.createServer(function (req, res) {
  const path = req.url;
  const queryData = new URL(path, 'http://' + req.headers.host + '/');
  const pathname = queryData.pathname;
  let title = queryData.searchParams.get('title');
  let list;
  let process;

  fs.readdir('./data', function (err, files) {
    list = template.list(files);
  });

  if (path === '/') title = 'Welcome';
  if (pathname === '/add') title = 'addForm';
  if (pathname === '/add_process') title = 'addProcess';
  if (pathname === '/update') process = 'update';
  if (pathname === '/updateProcess') title = 'updateProcess';
  if (pathname === '/deleteProcess') title = 'deleteProcess';

  const parsePath = _path.parse(title).base; // very very important!!
  fs.readFile(`data/${parsePath}`, 'utf8', (err, content) => {
    if (!err) {
      if (title === 'addForm') {
        var HTML = template.html(title, list, `<div>${content}</div>`, '');
      } else if (title === 'addProcess' || title === 'updateProcess') {
        template.addProcess(req, res);
        return;
      } else if (process === 'update') {
        var HTML = template.html(
          title,
          list,
          `<h2>Update</h2>
          <form action="/updateProcess" method="post">
            <p><input type="hidden" name="id" value="${title}"/></p>
            <p><input type="text" name="title" placeholder="title" value="${title}"/></p>
            <p><textarea name="description" placeholder="description...">${content}</textarea></p>
            <p><input type="submit" /></p>
          </form>
          `,
          ''
        );
      } else if (title === 'deleteProcess') {
        template.deleteProcess(req, res);
        return;
      } else {
        var HTML = template.html(
          title,
          list,
          `<h2>${title}</h2><div>${content}</div>`,
          `<a href="/add">Create</a>&nbsp;&nbsp;<a href="/update?title=${title}">Update</a>&nbsp;&nbsp;
          <form action="deleteProcess" method="post">
            <input type="hidden" name="id" value="${title}" />
            <input type="submit" value="Delete" />
          </form>`
        );
      }
      res.writeHead(200);
      res.end(HTML);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });
});

app.listen(3000);
