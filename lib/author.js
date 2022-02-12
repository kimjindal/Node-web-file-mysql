const template = require('./myModule');
const db = require('./db');
const sanitizeHtml = require('sanitize-html');

exports.home = function (res) {
  db.query('SELECT * FROM topic', function (err, topics) {
    if (err) throw err;
    db.query('SELECT * FROM author', function (err1, authors) {
      if (err1) throw err1;
      const title = 'Authors';
      const topiclist = template.topicList(topics);
      const authorlist = template.authorTable(authors);
      const html = template.html(
        title,
        topiclist,
        `
        <table>
          ${authorlist}
        </table>
        <style>
          table {
            border-collapse: collapse;
          }
          td {
            border: 1px solid #999;
            padding: 5px;
          }
        </style>
        <div class="author_form">
          <h5>Add a author</h5>
          <form method="post" action="/author/addProcess">
            <p><input type="text" name="name" placeholder="author's name"></p>
            <p><textarea name="profile" placeholder="author's profile"></textarea></p>
            <p><input type="submit" value="add"></p>
          </form>
        </div>
        `,
        '',
        ''
      );
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
    const name = sanitizeHtml(post.get('name'));
    const profile = sanitizeHtml(post.get('profile'));
    db.query(
      `INSERT INTO author (name, profile)
        VALUES(?, ?)`,
      [name, profile],
      function (err, result) {
        console.log(result.insertedId);
        if (err) throw err;
        res.writeHead(301, { Location: `/author` });
        res.end();
      }
    );
  });
};

exports.update = function (res, id) {
  db.query('SELECT * FROM topic', function (err, topics) {
    if (err) throw err;
    db.query('SELECT * FROM author', function (err1, authors) {
      if (err1) throw err1;
      db.query('SELECT * FROM author WHERE id=?', [id], function (err2, author) {
        if (err2) throw err2;
        const title = 'Authors';
        const topiclist = template.topicList(topics);
        const authorlist = template.authorTable(authors);
        const html = template.html(
          title,
          topiclist,
          `
          <table>
            ${authorlist}
          </table>
          <style>
            table {
              border-collapse: collapse;
            }
            td {
              border: 1px solid #999;
              padding: 5px;
            }
          </style>
          <div class="author_form">
            <h5>Update a author</h5>
            <form method="post" action="/author/updateProcess">
              <p><input type="hidden" name="id" value="${author[0].id}"></p>
              <p><input type="text" name="name" value="${author[0].name}"></p>
              <p><textarea name="profile">${author[0].profile}</textarea></p>
              <p><input type="submit" value="update"></p>
            </form>
          </div>
          `,
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
    const name = sanitizeHtml(post.get('name'));
    const profile = sanitizeHtml(post.get('profile'));
    db.query(
      'UPDATE author SET name=?, profile=? WHERE id=?',
      [name, profile, id],
      function (err, result) {
        console.log(result.changedRows);
        if (err) throw err;
        res.writeHead(301, { Location: `/author` });
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
    db.query('DELETE FROM author WHERE id=?', [id], function (err, result) {
      if (err) throw err;
      console.log(result.affectedRows);
      res.writeHead(301, { Location: '/author' });
      res.end();
    });
  });
};
