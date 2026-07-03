const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerHistory,
} = require('../controllers/customerController');

const router = express.Router();

router.use(auth);

router.get('/', getCustomers);
router.post(
  '/',
  [body('name').notEmpty().withMessage('Customer name is required')],
  createCustomer
);
router.get('/:id', getCustomerById);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);
router.get('/:id/history', getCustomerHistory);

module.exports = router;
