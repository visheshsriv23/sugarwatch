// Protect routes — redirect to login if not authenticated
const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  req.flash('error', 'Please log in to access that page.');
  res.redirect('/auth/login');
};

// Guest only — redirect to dashboard if already logged in
const ensureGuest = (req, res, next) => {
  if (!req.isAuthenticated()) return next();
  res.redirect('/dashboard');
};

// Attach user to locals for all views
const setLocals = (req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.appName = process.env.APP_NAME || 'SugarWatch';
  next();
};

module.exports = { ensureAuth, ensureGuest, setLocals };
