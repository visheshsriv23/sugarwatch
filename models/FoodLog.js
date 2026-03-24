const mongoose = require('mongoose');

const FoodLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productName: { type: String, required: true, trim: true },
  brand: { type: String, trim: true, default: '' },
  sugarG: { type: Number, required: true, min: 0 },
  tsp: { type: Number },
  calories: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    default: 'snack'
  },
  servingSize: { type: String, default: '100g' },
  barcode: { type: String, default: '' },
  loggedAt: { type: Date, default: Date.now }
});

// Auto-calculate teaspoons
FoodLogSchema.pre('save', function (next) {
  this.tsp = parseFloat((this.sugarG / 4).toFixed(2));
  next();
});

module.exports = mongoose.model('FoodLog', FoodLogSchema);
