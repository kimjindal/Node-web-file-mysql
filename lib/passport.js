module.exports = function (app) {
  const passport = require('passport');
  const LocalStrategy = require('passport-local').Strategy;
  const GoogleStrategy = require('passport-google-oauth20');
  const db = require('../lib/lowdb');

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function (id, done) {
    console.log('deserializeUser: ', id);
    const user = db.get('users').find({ id: id }).value();
    done(null, user);
  });

  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      function (username, password, done) {
        var user = db
          .get('users')
          .find({ email: username, password: password })
          .value();
        if (user) {
          console.log('success: ', user.id);
          return done(null, user, { message: 'Welcome!' });
        } else {
          console.log('failed: ', username);
          return done(null, false, {
            message: 'Please check your email and password',
          });
        }
      }
    )
  );

  const googleCredentials = require('../config/google_oauth.json');
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleCredentials.web.client_id,
        clientSecret: googleCredentials.web.client_secret,
        callbackURL: googleCredentials.web.redirect_uris[0],
        scope: ['profile'],
        state: true,
      },
      function (accessToken, refreshToken, profile, cb) {
        db.get(
          'SELECT * FROM federated_credentials WHERE provider = ? AND subject = ?',
          ['https://accounts.google.com', profile.id],
          function (err, cred) {
            if (err) {
              return cb(err);
            }
            if (!cred) {
              // The account at Google has not logged in to this app before.  Create a
              // new user record and associate it with the Google account.
              db.run(
                'INSERT INTO users (name) VALUES (?)',
                [profile.displayName],
                function (err) {
                  if (err) {
                    return cb(err);
                  }

                  var id = this.lastID;
                  db.run(
                    'INSERT INTO federated_credentials (user_id, provider, subject) VALUES (?, ?, ?)',
                    [id, 'https://accounts.google.com', profile.id],
                    function (err) {
                      if (err) {
                        return cb(err);
                      }
                      var user = {
                        id: id,
                        name: profile.displayName,
                      };
                      return cb(null, user);
                    }
                  );
                }
              );
            } else {
              // The account at Google has previously logged in to the app.  Get the
              // user record associated with the Google account and log the user in.
              db.get(
                'SELECT * FROM users WHERE id = ?',
                [cred.user_id],
                function (err, user) {
                  if (err) {
                    return cb(err);
                  }
                  if (!user) {
                    return cb(null, false);
                  }
                  return cb(null, user);
                }
              );
            }
          }
        );
      }
    )
  );

  app.get('/auth/google', passport.authenticate('google'));
  app.get(
    '/oauth2/redirect/google',
    passport.authenticate('google', {
      failureRedirect: '/auth/login',
      failureMessage: true,
    }),
    function (req, res) {
      res.redirect('/');
    }
  );

  return passport;
};
