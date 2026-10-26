const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

function issueToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}
function validationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: 'Please correct the input fields.', errors: errors.array().map(e => ({ field: e.path, message: e.msg })) });
    return true;
  }
  return false;
}
async function register(req, res, next) {
  try {
    if (validationErrors(req, res)) return;
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashedPassword });
    return res.status(201).json({ success: true, message: 'Account created successfully.', data: { user: { id: user._id, name: user.name, email: user.email }, token: issueToken(user._id) } });
  } catch (error) { next(error); }
}
async function login(req, res, next) {
  try {
    if (validationErrors(req, res)) return;
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ success: false, message: 'Email or password is incorrect.' });
    return res.status(200).json({ success: true, message: 'Login successful.', data: { user: { id: user._id, name: user.name, email: user.email }, token: issueToken(user._id) } });
  } catch (error) { next(error); }
}
function me(req, res) {
  res.status(200).json({ success: true, data: { user: { id: req.user._id, name: req.user.name, email: req.user.email } } });
}
module.exports = { register, login, me };
