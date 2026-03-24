const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const Product = require('../models/Product');

// GET /products
router.get('/', ensureAuth, async (req, res) => {
  try {
    const { q, category, rating } = req.query;
    const filter = {};
    if (q) filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { brand: { $regex: q, $options: 'i' } }
    ];
    if (category && category !== 'All') filter.category = category;
    // In router.get('/'), replace the rating filter logic:
if (rating && rating !== 'All') {
    if (rating === 'ok') {
        filter.sugarG = { $lt: 10 };
    } else if (rating === 'warn') {
        filter.sugarG = { $gte: 10, $lte: 20 };
    } else if (rating === 'danger') {
        filter.sugarG = { $gt: 20 };
    }
}

    const products = await Product.find(filter).sort({ sugarG: -1 }).limit(50);
    const categories = ['All', 'Biscuits', 'Beverages', 'Snacks', 'Noodles', 'Dairy', 'Sauces', 'Cereals', 'Other'];
const getSugarRating = (sugarGrams, servingSize) => {
  // Normalize to sugar per 100g/ml for standard rating
  const sugarPer100 = (sugarGrams / servingSize) * 100;

  if (sugarPer100 <= 5) return "Low";
  if (sugarPer100 <= 22.5) return "Medium";
  return "High";
};

    res.render('products/index', {
      title: 'Product Database',
      products: products,
      userLimit: req.user.dailyLimit || 25,
      categories,
      q: q || '',
      selectedCategory: category || 'All',
      selectedRating: rating || 'All',
      layout: 'layouts/main'
    });
  } catch (err) {
    req.flash('error', 'Could not load products.');
    res.redirect('/dashboard');
  }
});

// GET /products/:id
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) { req.flash('error', 'Product not found.'); return res.redirect('/products'); }
    const similar = await Product.find({ category: product.category, _id: { $ne: product._id } }).limit(4);
    res.render('products/detail', {
      title: product.name,
      product,
      similar,
      layout: 'layouts/main'
    });
  } catch (err) {
    req.flash('error', 'Product not found.');
    res.redirect('/products');
  }
});

module.exports = router;
