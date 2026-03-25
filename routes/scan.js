const express = require('express');
const router = express.Router();
const axios = require('axios'); // For API calls
const Product = require('../models/Product');
const { ensureAuth } = require('../middleware/auth');

// GET /products/barcode/:barcode
router.get('/barcode/:barcode', ensureAuth, async (req, res) => {
    const code = req.params.barcode;

    try {
        // 1. Check local Database first
        let product = await Product.findOne({ barcode: code });

        if (product) {
            return res.render('products/detail', { 
                product, 
                title: product.name,
                layout: 'layouts/main' 
            });
        }

        // 2. Not in DB? Fetch from Open Food Facts API
        const apiUrl = `https://world.openfoodfacts.org/api/v0/product/${code}.json`;
        const response = await axios.get(apiUrl);

        if (response.data.status === 1) {
            const data = response.data.product;

            // Map API data to your Schema
            const externalProduct = {
                _id: 'external_' + code, // Temporary ID for rendering
                name: data.product_name || 'Unknown Product',
                brand: data.brands || 'Unknown Brand',
                barcode: code,
                sugarG: parseFloat(data.nutriments['sugars_100g']) || 0,
                servingSize: data.serving_size || '100g',
                calories: data.nutriments['energy-kcal_100g'] || 0,
                category: data.categories ? data.categories.split(',')[0] : 'General',
                isExternal: true // Flag to show it's from API
            };

            res.render('products/detail', { 
                product: externalProduct, 
                title: externalProduct.name,
                layout: 'layouts/main'
            });

        } else {
            req.flash('error', 'Product not found. Try entering details manually.');
            res.redirect('/products');
        }
    } catch (err) {
        console.error("Scanning Error:", err);
        res.redirect('/dashboard');
    }
});

module.exports = router;
