const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const FoodLog = require('../models/FoodLog');

// GET /dashboard
router.get('/', ensureAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

    // Today's logs
    const todayLogs = await FoodLog.find({
      user: req.user._id,
      loggedAt: { $gte: today, $lt: tomorrow }
    }).sort({ loggedAt: -1 });

    const todaySugar = todayLogs.reduce((s, l) => s + l.sugarG, 0);
    const limit = req.user.dailyLimit || 25;
    const remaining = Math.max(0, limit - todaySugar);
    const pct = Math.min(Math.round((todaySugar / limit) * 100), 100);

    // Weekly data (last 7 days)
    const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 6);
    const weekLogs = await FoodLog.find({
      user: req.user._id,
      loggedAt: { $gte: weekAgo, $lt: tomorrow }
    });

    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      const nd = new Date(d); nd.setDate(d.getDate() + 1);
      const dayLogs = weekLogs.filter(l => l.loggedAt >= d && l.loggedAt < nd);
      const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' });
      weekData.push({ day: dayName, sugar: parseFloat(dayLogs.reduce((s, l) => s + l.sugarG, 0).toFixed(1)) });
    }

    const weekAvg = weekData.length ? parseFloat((weekData.reduce((s, d) => s + d.sugar, 0) / 7).toFixed(1)) : 0;

    // Meal breakdown
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    const mealBreakdown = {};
    mealTypes.forEach(m => {
      const ml = todayLogs.filter(l => l.mealType === m);
      mealBreakdown[m] = parseFloat(ml.reduce((s, l) => s + l.sugarG, 0).toFixed(1));
    });

    res.render('dashboard/index', {
      title: 'Dashboard',
      todayLogs,
      todaySugar: parseFloat(todaySugar.toFixed(1)),
      remaining: parseFloat(remaining.toFixed(1)),
      pct,
      limit,
      weekData,
      weekAvg,
      mealBreakdown,
      layout: 'layouts/main'
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not load dashboard.');
    res.redirect('/');
  }
});


// DELETE /dashboard/log/:id
router.delete('/log/:id', ensureAuth, async (req, res) => {
  try {
    const log = await FoodLog.findOne({ _id: req.params.id, user: req.user._id });
    if (!log) return res.status(404).json({ success: false });
    await log.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;
