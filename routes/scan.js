const express = require('express');
const router = express.Router();
const axios = require('axios');
const Product = require('../models/Product');
const { ensureAuth } = require('../middleware/auth');
const FoodLog = require('../models/FoodLog');

// 1. Render the Scan Page
router.get('/', ensureAuth, (req, res) => {
    res.render('scan/index', {
        title: 'Scan Product',
        layout: 'layouts/main'
    });
});

// 2. FIXED: The Manual Search Handler
// This catches the POST from your "Go" button and redirects to the GET route below
router.post('/search-barcode', ensureAuth, (req, res) => {
    const barcode = req.body.barcode; // Ensure your EJS input has name="barcode"
    if (!barcode) {
        req.flash('error', 'Please enter a barcode');
        return res.redirect('/scan');
    }
    // Redirects to /scan/barcode/123456...
    res.redirect(`/scan/barcode/${barcode}`); 
});

// 3. FIXED: The Barcode Result Logic
router.get('/barcode/:barcode', ensureAuth, async (req, res) => {
    const code = req.params.barcode;

    try {
        // Step A: Check local Database first
        let product = await Product.findOne({ barcode: code });

        if (product) {
            return res.render('products/detail', { 
                product, 
                title: product.name,
                similar:[],
                layout: 'layouts/main' 
            });
        }

        // Step B: Not in DB? Fetch from Open Food Facts API
        // FIX: Using v2 API for more reliable results
        const apiUrl = `https://world.openfoodfacts.org/api/v2/product/${code}.json`;
        const response = await axios.get(apiUrl);

        // API returns status "product_found" or 1 depending on version
        if (response.data.status === 1 || response.data.status === 'product_found') {
              const data = response.data.product;
              const nutriments = data.nutriments || {};

              const externalProduct = {
                  _id: 'external_' + code,
                  // Try multiple name fields from the API
                  name: data.product_name || data.product_name_en || data.generic_name || 'Product Not in Database',
                  brand: data.brands || data.brand_owner || 'Generic Brand',
                  barcode: code,
                  // Ensure numbers are handled even if they are missing
                  sugarG: parseFloat(nutriments.sugars_100g || nutriments.sugars || 0),
                  calories: parseFloat(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0),
                  carbs: parseFloat(nutriments.carbohydrates_100g || 0),
                  fat: parseFloat(nutriments.fat_100g || 0),
                  protein: parseFloat(nutriments.proteins_100g || 0),
                  isExternal: true 
              };
              await Product.findOneAndUpdate(
                  { _id: externalProduct._id }, 
                  externalProduct, 
                  { upsert: true, new: true }
              );
            res.render('products/detail', { 
                product: externalProduct, 
                title: externalProduct.name,
                similar: [],
                layout: 'layouts/main'
            });

        } else {
            req.flash('error', 'Product not found in database or API.');
            res.redirect('/scan'); // Redirect back to scan to try manual entry
        }
    } catch (err) {
        console.error("Scanning Error:", err);
        req.flash('error', 'Error connecting to food database.');
        res.redirect('/scan');
    }
});

// 4. Log the Food to Dashboard
router.post('/log', ensureAuth, async (req, res) => {
    try {
        // ADD carbs, fat, and barcode to this destructuring line!
        const { name, brand, sugarG, calories, carbs, fat, barcode, mealType } = req.body;

        await FoodLog.create({
            user: req.user._id, // Use _id to match your dashboard query
            productName: name, 
            brand: brand || '',
            sugarG: parseFloat(sugarG) || 0,
            calories: parseFloat(calories) || 0,
            carbs: parseFloat(carbs) || 0,
            fat: parseFloat(fat) || 0,
            mealType: mealType || 'snack',
            barcode: barcode || '',
            loggedAt: new Date() // Correct key name for your schema
        });

        req.flash('success', 'Food logged successfully!');
        res.redirect('/dashboard');
    } catch (err) {
        console.error("Manual Log Error:", err);
        req.flash('error', 'Failed to log food.');
        res.redirect('/scan');
    }
});

module.exports = router;
