const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const Product = require('../models/Product');
const FoodLog = require('../models/FoodLog');

// GET /scan
router.get('/', ensureAuth, (req, res) => {
  res.render('scan/index', { title: 'Scan Product', product: null, layout: 'layouts/main' });
});

// GET /scan/lookup?barcode=xxx  (AJAX)
router.get('/lookup', ensureAuth, async (req, res) => {
  try {
    const { barcode } = req.query;
    if (!barcode) return res.json({ success: false, message: 'No barcode provided' });
    const product = await Product.findOne({ barcode });
    if (!product) return res.json({ success: false, message: 'Product not found in database' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /scan/log — log a scanned or manual product
router.post('/log', ensureAuth, async (req, res) => {
  try {
    const { productName, brand, sugarG, calories, carbs, fat, mealType, servingSize, barcode } = req.body;
    await FoodLog.create({
      user: req.user._id,
      productName,
      brand: brand || '',
      sugarG: parseFloat(sugarG) || 0,
      calories: parseFloat(calories) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      mealType: mealType || 'snack',
      servingSize: servingSize || '100g',
      barcode: barcode || ''
    });
    req.flash('success', `${productName} logged successfully!`);
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not log this item. Please try again.');
    res.redirect('/scan');
  }
});

module.exports = router;
