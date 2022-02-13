const http = require('http');
const fs = require('fs');
const pathParse = require('path-parse');
// const qs = require('querystring');
// const url = require('url');
// The querystring API has been deprecated.
// New code should use the URLSearchParams API instead.
const template = require('./lib/webModule');

var app = http.createServer(function (req, res) {
  const path = req.url;
  const queryData = new URL(path, 'http://' + req.headers.host + '/');
  const pathname = queryData.pathname;
  let title = queryData.searchParams.get('title');
  let list;
  let process;

  fs.readdir('./data', function (err, files) {
    if (err) throw err;
    list = template.list(files);
  });

  // A file with the same name as the title must exist in data folder.
  if (path === '/') title = 'Welcome';
  if (pathname === '/add') title = 'addForm';
  if (pathname === '/addProcess') title = 'addProcess';
  if (pathname === '/update') process = 'update';
  if (pathname === '/updateProcess') title = 'updateProcess';
  if (pathname === '/deleteProcess') title = 'deleteProcess';
  if (pathname === '/login') title = 'loginForm';
  if (pathname === '/loginProcess') title = 'loginProcess';
  if (pathname === '/logout') title = 'logoutProcess';
  // if (pathname === '/favicon.ico') title = 'Welcome';

  if (title === null || title === undefined) title = 'Welcome';

  // check to cookie and display control div
  let auth = template.loginAuth(req);
  let control = '';
  if (auth.loginOK) {
    control = template.controlForm(title);
    loginStatus = auth.loginStatus;
  } else {
    loginStatus = auth.loginStatus;
  }

  const parsePath = pathParse(title).base; // very very important!!

  fs.readFile(`data/${parsePath}`, 'utf8', (err, content) => {
    if (!err) {
      if (title === 'addForm') {
        var HTML = template.html(title, list, `<div>${content}</div>`, '', loginStatus);
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
          '',
          loginStatus
        );
      } else if (title === 'deleteProcess') {
        template.deleteProcess(req, res);
        return;
      } else if (title === 'loginForm') {
        var HTML = template.html(
          title,
          list,
          `<h4>Login by google</h4>
          <div>
            <form action="/loginProcess" method="post">
              <p><input type="text" name="email" pattern=".+@google\.com" size="20" placeholder="your@google.com" required /></p>
              <p><input type="submit" /></p>
            </form>
          </div>
          `,
          '',
          loginStatus
        );
      } else if (title === 'loginProcess') {
        template.loginProcess(req, res);
        return;
      } else if (title === 'logoutProcess') {
        template.logoutProcess(res);
        return;
      } else {
        var HTML = template.html(
          title,
          list,
          `<h2>${title}</h2><div>${content}</div>`,
          control,
          loginStatus
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
