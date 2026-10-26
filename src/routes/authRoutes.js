const router = require('express').Router();
const { body } = require('express-validator');
const { register, login, me } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
router.post('/register', [body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 60 }).withMessage('Name must be 60 characters or fewer.'), body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(), body('password').isString().isLength({ min: 8, max: 72 }).withMessage('Password must be between 8 and 72 characters.')], register);
router.post('/login', [body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(), body('password').isString().notEmpty().withMessage('Password is required.')], login);
router.get('/me', protect, me);
module.exports = router;
