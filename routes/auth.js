const express = require('express');
const router = express.Router();
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { ensureGuest } = require('../middleware/auth');

// GET /auth/login
router.get('/login', ensureGuest, (req, res) => {
  res.render('auth/login', { title: 'Sign In', layout: 'layouts/auth' });
});

// POST /auth/login
router.post('/login', ensureGuest, [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password required')
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect('/auth/login');
  }
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/auth/login',
    failureFlash: true
  })(req, res, next);
});

// GET /auth/signup
router.get('/signup', ensureGuest, (req, res) => {
  res.render('auth/signup', { title: 'Create Account', layout: 'layouts/auth' });
});

// POST /auth/signup
router.post('/signup', ensureGuest, [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((val, { req }) => {
    if (val !== req.body.password) throw new Error('Passwords do not match');
    return true;
  })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect('/auth/signup');
  }
  try {
    const existing = await User.findOne({ email: req.body.email });
    if (existing) {
      req.flash('error', 'An account with that email already exists.');
      return res.redirect('/auth/signup');
    }
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    });
    req.login(user, err => {
      if (err) { req.flash('error', 'Login failed after signup.'); return res.redirect('/auth/login'); }
      req.flash('success', `Welcome to SugarWatch, ${user.name.split(' ')[0]}! 🎉`);
      res.redirect('/dashboard');
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/auth/signup');
  }
});

// GET /auth/logout
router.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.flash('success', 'You have been logged out.');
    res.redirect('/auth/login');
  });
});

module.exports = router;
