const { validationResult } = require('express-validator');
const Product = require('../models/Product');
function check(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: 'Please correct the product details.', errors: errors.array().map(e => ({ field: e.path, message: e.msg })) });
    return true;
  }
  return false;
}
async function listProducts(req, res, next) {
  try {
    const { category, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };
    const products = await Product.find(filter).sort({ createdAt: -1 }).populate('createdBy', 'name');
    res.status(200).json({ success: true, count: products.length, data: { products } });
  } catch (error) { next(error); }
}
async function getProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id).populate('createdBy', 'name');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.status(200).json({ success: true, data: { product } });
  } catch (error) { next(error); }
}
async function createProduct(req, res, next) {
  try {
    if (check(req, res)) return;
    const product = await Product.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, message: 'Product created.', data: { product } });
  } catch (error) { next(error); }
}
async function updateProduct(req, res, next) {
  try {
    if (check(req, res)) return;
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.status(200).json({ success: true, message: 'Product updated.', data: { product } });
  } catch (error) { next(error); }
}
async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.status(200).json({ success: true, message: 'Product deleted.', data: { id: product._id } });
  } catch (error) { next(error); }
}
module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
