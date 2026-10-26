const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, trim: true, maxlength: 1000 },
  category: { type: String, required: true, trim: true, enum: ['Phones', 'Laptops', 'Audio', 'Wearables', 'Accessories', 'Gaming'] },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, trim: true, default: '' },
  stock: { type: Number, required: true, min: 0, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
productSchema.index({ name: 'text', description: 'text', category: 'text' });
module.exports = mongoose.model('Product', productSchema);
