const template = require('./myModule');
const db = require('./db');
const sanitizeHtml = require('sanitize-html');

exports.home = function (res) {
  db.query('SELECT * FROM topic', function (err, results) {
    if (err) throw err;
    const title = 'Welcome';
    const description = 'Hello, MySQL with Node.js!';

    const list = template.topicList(results);
    const html = template.html(
      title,
      list,
      description,
      '',
      '<div class="control"><a href="/add">Create</a></div>'
    );
    res.writeHead(200);
    res.end(html);
  });
};

exports.page = function (res, id) {
  db.query('SELECT * FROM topic', function (err, results) {
    if (err) throw err;
    // VERY important!! : where id=?
    db.query(
      `SELECT topic.id,title,description, author.name FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`,
      [id],
      function (err1, row) {
        if (err1) throw err1;
        if (row.length === 0) {
          res.writeHead(404);
          res.end('Invalid Page...?!');
          return;
        }

        const title = row[0].title;
        const description = row[0].description;
        const author = row[0].name;
        const list = template.topicList(results);
        const html = template.html(
          title,
          list,
          description,
          `<h4><i>by ${author}</i></h4>`,
          `<div class="control">
             <a href="/add">Create</a>
             <a href="/update?id=${id}">Update</a>
             <form action="deleteProcess" method="post">
               <input type="hidden" name="id" value="${id}" />
               <input type="submit" value="Delete" />
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
          </style>`
        );
        res.writeHead(200);
        res.end(html);
      }
    );
  });
};

exports.add = function (res) {
  db.query('SELECT * FROM topic', function (err, topics) {
    if (err) throw err;
    db.query('SELECT * FROM author', function (err1, authors) {
      if (err1) throw err1;
      const title = 'Create a new Article';
      const authorSelect = template.authorList(authors, '');
      const description = `
        <form action="/addProcess" method="post">
          <p><input type="text" name="title" placeholder="title"/></p>
          <p><textarea name="description" placeholder="description..."></textarea></p>
          <p>${authorSelect}</p>
          <p><input type="submit" /></p>
        </form>`;
      const list = template.topicList(topics);
      const html = template.html(title, list, description, '', '');
      res.writeHead(200);
      res.end(html);
    });
  });
};

exports.addProcess = function (req, res) {
  var body = '';
  req.on('data', function (data) {
    body += data;
  });
  req.on('end', function () {
    let post = new URLSearchParams(body);
    const title = sanitizeHtml(post.get('title')); // VERY important!!
    const description = sanitizeHtml(post.get('description'));
    const authorId = post.get('authorId');
    db.query(
      `INSERT INTO topic (title, description, created, author_id)
        VALUES(?, ?, NOW(), ?)`,
      [title, description, authorId],
      function (err, result) {
        if (err) throw err;
        res.writeHead(301, { Location: `/?id=${result.insertId}` });
        res.end();
      }
    );
  });
};

exports.update = function (res, id) {
  db.query('SELECT * FROM topic', function (err, results) {
    if (err) throw err;
    db.query('SELECT * FROM author', function (err1, authors) {
      if (err1) throw err;
      // VERY important!! : where id=?
      db.query(`SELECT * FROM topic WHERE id=?`, [id], function (err2, row) {
        if (err2) throw err2;
        const authorId = row[0].author_id;
        const title = row[0].title;
        const description = row[0].description;
        const list = template.topicList(results);
        const authorSelect = template.authorList(authors, authorId);
        const html = template.html(
          title,
          list,
          `<form action="/updateProcess" method="post">
              <p><input type="hidden" name="id" value="${id}"/></p>
              <p><input type="text" name="title" value="${title}"/></p>
              <p><textarea name="description">${description}</textarea></p>
              <p>${authorSelect}</p>
              <p><input type="submit" /></p>
            </form>`,
          '',
          ''
        );
        res.writeHead(200);
        res.end(html);
      });
    });
  });
};

exports.updateProcess = function (req, res) {
  var body = '';
  req.on('data', function (data) {
    body += data;
  });
  req.on('end', function () {
    let post = new URLSearchParams(body);
    const id = post.get('id');
    const title = sanitizeHtml(post.get('title')); // VERY important!!
    const description = sanitizeHtml(post.get('description'));
    const authorId = post.get('authorId');
    db.query(
      'UPDATE topic SET title=?, description=?, author_id=? WHERE id=?',
      [title, description, authorId, id],
      function (err, result) {
        console.log(result.changedRows);
        if (err) throw err;
        res.writeHead(301, { Location: `/?id=${id}` });
        res.end();
      }
    );
  });
};

exports.deleteProcess = function (req, res) {
  var body = '';
  req.on('data', function (data) {
    body += data;
  });
  req.on('end', function () {
    let post = new URLSearchParams(body);
    const id = post.get('id');
    db.query('DELETE FROM topic WHERE id=?', [id], function (err, result) {
      if (err) throw err;
      console.log(result.affectedRows);
      res.writeHead(301, { Location: '/' });
      res.end();
    });
  });
};
