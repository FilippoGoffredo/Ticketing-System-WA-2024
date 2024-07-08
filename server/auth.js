// auth.js

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const jwt = require('jsonwebtoken');

/**
 * Helper function to initialize passport authentication with the LocalStrategy
 * 
 * @param app express app
 * @param db instance of an active Database object
 */
function initAuthentication(app, db) {
  // Setup passport
  passport.use(new LocalStrategy((email, password, done) => {
    db.authUser(email.toLowerCase(), password)
      .then(user => {
        if (user) done(null, user);
        else done({ status: 401, msg: "Incorrect email or password" }, false);
      })
      .catch(() => done({ status: 500, msg: "Database error" }, false));
  }));

  // Serialization and deserialization of the user to and from a cookie
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    db.getUserById(id)
      .then(user => done(null, user))
      .catch(err => done(err, null));
  });

  // Initialize express-session
  app.use(session({
    secret: "586e60fdeb6f34186ae165a0cea7ee1dfa4105354e8c74610671de0ef9662191", 
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: app.get('env') === 'production' ? true : false },
  }));

  // Initialize passport middleware
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(passport.authenticate('session'));
  
}



/**
 * Express middleware to check if the user is authenticated.
 * Responds with a 401 Unauthorized in case they're not.
 */
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ errors: ["Not authenticated"] });
}

/**
 * Express middleware to check if the user is an administrator.
 * Responds with a 403 Forbidden if they're not an admin.
 */
function isAdmin(req, res, next) {
  if (req.user && req.user.admin) return next();
  return res.status(403).json({ errors: ["Not authorized as an administrator"] });
}

/**
 * Generate a JWT token for a user
 * 
 * @param user User object containing at least id
 * @returns JWT token
 
function generateAuthToken(user) {
  const payload = {
    userId: user.id
    // You can add more data to the payload if needed
  };
  const token = jwt.sign(payload, 'your_jwt_secret', { expiresIn: '1h' }); // Adjust expiration as needed
  return token;
}
*/

module.exports = { initAuthentication, isLoggedIn, isAdmin} 
