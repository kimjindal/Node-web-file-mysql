const http = require('http');
const topic = require('./lib/topic');
const author = require('./lib/author');

var app = http.createServer(function (req, res) {
  const path = req.url;
  const queryData = new URL(path, 'http://' + req.headers.host + '/');
  const pathname = queryData.pathname;
  let id = queryData.searchParams.get('id');

  if (pathname === '/') {
    if (id === null || id === undefined) {
      topic.home(res);
    } else {
      topic.page(res, id);
    }
  } else if (pathname === '/add') {
    topic.add(res);
  } else if (pathname === '/addProcess') {
    topic.addProcess(req, res);
  } else if (pathname === '/update') {
    topic.update(res, id);
  } else if (pathname === '/updateProcess') {
    topic.updateProcess(req, res);
  } else if (pathname === '/deleteProcess') {
    topic.deleteProcess(req, res);
  } else if (pathname === '/author') {
    author.home(res);
  } else if (pathname === '/author/addProcess') {
    author.addProcess(req, res);
  } else if (pathname === '/author/update') {
    author.update(res, id);
  } else if (pathname === '/author/updateProcess') {
    author.updateProcess(req, res);
  } else if (pathname === '/author/deleteProcess') {
    author.deleteProcess(req, res);
  } else {
    res.writeHead(404);
    res.end('Invalid Page...?!');
  }
});

app.listen(3000);
