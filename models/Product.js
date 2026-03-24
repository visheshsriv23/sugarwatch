const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  brand: { type: String, required: true, trim: true },
  barcode: { type: String, unique: true, sparse: true },
  category: {
    type: String,
    // enum: ['Biscuits', 'Beverages', 'Snacks', 'Noodles', 'Dairy', 'Sauces', 'Cereals', 'Other'],
    default: 'Other'
  },
  servingSize: { type: String, default: '100g' },
  sugarG: { type: Number, required: true, min: 0 },
  calories: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  hiddenSugars: [String],
  rating: { type: String, enum: ['ok', 'warn', 'danger'], default: 'ok' },
  createdAt: { type: Date, default: Date.now }
});

// Auto-set rating based on sugar
ProductSchema.pre('save', function (next) {
  if (this.sugarG >= 20) this.rating = 'danger';
  else if (this.sugarG >= 10) this.rating = 'warn';
  else this.rating = 'ok';
  next();
});

// Virtual teaspoons
ProductSchema.virtual('tsp').get(function () {
  return parseFloat((this.sugarG / 4).toFixed(2));
});

ProductSchema.virtual('pctDailyLimit').get(function () {
  return Math.round((this.sugarG / 25) * 100);
});

ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', ProductSchema);
