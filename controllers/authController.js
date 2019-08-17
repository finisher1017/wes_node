const passport = require('passport');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login',
  successRedirect: '/',
  successFlash: 'You are now logged in!'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'Successfully logged out!');
  res.redirect('/');
}

exports.isLoggedIn = (req, res, next) => {
  // first check if the user is authenticated
  if(req.isAuthenticated()) {
    next(); // continue
    return;
  }
  req.flash('error', 'You must be logged in to add a store.');
  res.redirect('/login');
}