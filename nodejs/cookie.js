const http = require('http');
const cookie = require('cookie');

http
  .createServer(function (req, res) {
    // To read a cookie
    const reqCookie = req.headers.cookie;
    if (reqCookie !== undefined) {
      const cookies = cookie.parse(req.headers.cookie);
      console.log(cookies);
    }

    // To write a cookie
    res.writeHead(200, {
      'Set-Cookie': [
        'yummy_cookie=choco',
        'tasty_cookie=strawberry',
        `permanent=cookie;Max-Age=${60 * 60 * 24 * 30}`,
        'secure=secure; Secure',
        'httponly=httponly; HttpOnly',
        'path=path; Path=/cookie',
        'domain=domain; Domain=google.com',
      ],
      'Content-Type': 'text/plain',
    });
    res.end('Cookied!');
  })
  .listen(3000);
