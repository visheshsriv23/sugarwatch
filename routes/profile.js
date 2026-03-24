const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { ensureAuth } = require('../middleware/auth');
const User = require('../models/User');
const FoodLog = require('../models/FoodLog');
const bcrypt = require('bcryptjs');

// GET /profile
router.get('/', ensureAuth, async (req, res) => {
  try {
    const totalLogs = await FoodLog.countDocuments({ user: req.user._id });
    const allLogs = await FoodLog.find({ user: req.user._id });
    const avgSugar = allLogs.length
      ? parseFloat((allLogs.reduce((s, l) => s + l.sugarG, 0) / allLogs.length).toFixed(1))
      : 0;
    res.render('profile/index', {
      title: 'My Profile',
      totalLogs,
      avgSugar,
      layout: 'layouts/main'
    });
  } catch (err) {
    req.flash('error', 'Could not load profile.');
    res.redirect('/dashboard');
  }
});

// POST /profile/update
router.post('/update', ensureAuth, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('dailyLimit').isFloat({ min: 1, max: 200 }).withMessage('Daily limit must be between 1-200g')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect('/profile');
  }
  try {
    await User.findByIdAndUpdate(req.user._id, {
      name: req.body.name,
      age: req.body.age || undefined,
      gender: req.body.gender || '',
      dailyLimit: parseFloat(req.body.dailyLimit) || 25
    });
    req.flash('success', 'Profile updated successfully!');
    res.redirect('/profile');
  } catch (err) {
    req.flash('error', 'Update failed. Try again.');
    res.redirect('/profile');
  }
});

// POST /profile/change-password
router.post('/change-password', ensureAuth, [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  body('confirmPassword').custom((val, { req }) => {
    if (val !== req.body.newPassword) throw new Error('Passwords do not match');
    return true;
  })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect('/profile');
  }
  try {
    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(req.body.currentPassword);
    if (!isMatch) {
      req.flash('error', 'Current password is incorrect.');
      return res.redirect('/profile');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);
    user.password = hashedPassword;
    await user.save();
    req.flash('success', 'Password changed successfully!');
    res.redirect('/profile');
  } catch (err) {
    req.flash('error', 'Password change failed.');
    res.redirect('/profile');
  }
});

// GET /profile/history
router.get('/history', ensureAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const total = await FoodLog.countDocuments({ user: req.user._id });
    const logs = await FoodLog.find({ user: req.user._id })
      .sort({ loggedAt: -1 })
      .skip(skip).limit(limit);
    res.render('profile/history', {
      title: 'Food History',
      logs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
      layout: 'layouts/main'
    });
  } catch (err) {
    req.flash('error', 'Could not load history.');
    res.redirect('/profile');
  }
});

module.exports = router;
