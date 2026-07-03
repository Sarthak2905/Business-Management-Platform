const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  updatePaymentStatus,
} = require('../controllers/invoiceController');

const router = express.Router();

router.use(auth);

router.get('/', getInvoices);
router.post(
  '/',
  [
    body('customerId').notEmpty().withMessage('Customer is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  ],
  createInvoice
);
router.get('/:id', getInvoiceById);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);
router.put('/:id/payment', updatePaymentStatus);

module.exports = router;
