const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const Product = require('../models/Product');
 const FoodLog = require('../models/FoodLog');

// GET /products
router.get('/', ensureAuth, async (req, res) => {
    try {
        const { q, category, rating } = req.query;
        const filter = {};

        if (q) {
            filter.$or = [
                { name: { $regex: q, $options: 'i' } },
                { brand: { $regex: q, $options: 'i' } }
            ];
        }

        if (category && category !== 'All') {
            filter.category = category;
        }

        // Fix the Rating filter logic
        if (rating && rating !== 'All') {
            if (rating === 'ok') filter.rating = 'ok';
            else if (rating === 'warn') filter.rating = 'warn';
            else if (rating === 'danger') filter.rating = 'danger';
        }

        const products = await Product.find(filter).sort({ createdAt: -1 });
        
        // This is the line that makes your categories dynamic!
        const categories = ['All', ...(await Product.distinct('category'))];

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
        console.error("DATABASE ERROR:", err);
        // Temporarily change this to res.send(err) to see the error on screen if it fails again
        res.status(500).send("Internal Server Error: " + err.message);
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

// POST /products/log-food/:id
router.post('/log-food/:id', ensureAuth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        const gramsEaten = parseFloat(req.body.consumedGrams);

        // Calculate sugar based on your rating logic: (sugarG / servingSize) * gramsEaten
        const sugarConsumed = (product.sugarG / product.servingSize) * gramsEaten;

        // Save to FoodLog (make sure you require the FoodLog model at the top!)
        await FoodLog.create({
            user: req.user.id,
            productId: product._id,
            productName: product.name,
            amountEaten: gramsEaten,
            sugarG: sugarConsumed,
            date: new Date()
        });

        req.flash('success', `Logged ${sugarConsumed.toFixed(1)}g of sugar!`);
        // res.redirect('/dashboard');
    // Temporarily replace your catch block with this:
} catch (err) {
    console.error("DETAILED ERROR:", err); // This goes to Render Logs
    res.send(`<h1>Developer Debug Error</h1><p>${err.message}</p><pre>${err.stack}</pre>`); 
    // This will show the error directly on your screen instead of redirecting!
}
});

module.exports = router;
