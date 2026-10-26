const router = require('express').Router();
const { body, param } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const { listProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const categories = ['Phones', 'Laptops', 'Audio', 'Wearables', 'Accessories', 'Gaming'];
const productRules = [
  body('name').trim().notEmpty().withMessage('Product name is required.').isLength({ max: 100 }).withMessage('Name must be 100 characters or fewer.'),
  body('description').trim().notEmpty().withMessage('Description is required.').isLength({ max: 1000 }).withMessage('Description must be 1000 characters or fewer.'),
  body('category').isIn(categories).withMessage(`Category must be one of: ${categories.join(', ')}.`),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a number greater than or equal to 0.'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a whole number greater than or equal to 0.'),
  body('image').optional({ values: 'falsy' }).isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('Image must be a valid http or https URL.')
];
router.use(protect);
router.route('/').get(listProducts).post(productRules, createProduct);
router.route('/:id').get(param('id').isMongoId().withMessage('Invalid product ID.'), getProduct).put(param('id').isMongoId().withMessage('Invalid product ID.'), productRules, updateProduct).delete(param('id').isMongoId().withMessage('Invalid product ID.'), deleteProduct);
module.exports = router;
