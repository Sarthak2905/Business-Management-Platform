const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');

const ALLOWED_STATUSES = ['paid', 'unpaid'];

const getInvoices = async (req, res) => {
  try {
    const { customerId, paymentStatus, page = 1, limit = 20 } = req.query;
    const query = { userId: req.user.id };
    if (customerId && mongoose.isValidObjectId(customerId)) {
      query.customerId = new mongoose.Types.ObjectId(customerId);
    }
    if (paymentStatus && ALLOWED_STATUSES.includes(paymentStatus)) {
      query.paymentStatus = paymentStatus;
    }

    const invoices = await Invoice.find(mongoose.sanitizeFilter(query))
      .populate('customerId', 'name phone')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Invoice.countDocuments(mongoose.sanitizeFilter(query));

    res.json({ invoices, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user.id }).populate(
      'customerId',
      'name phone address'
    );
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const createInvoice = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { customerId, items, tax, discount, date } = req.body;

    if (!mongoose.isValidObjectId(customerId)) {
      return res.status(400).json({ message: 'Invalid customer ID' });
    }

    const customer = await Customer.findOne({
      _id: new mongoose.Types.ObjectId(customerId),
      userId: req.user.id,
    });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const processedItems = items.map((item) => {
      const sqFt = (item.width || 0) * (item.height || 0) * (item.quantity || 1);
      const amount = sqFt > 0 ? sqFt * item.rate : (item.quantity || 1) * item.rate;
      return { ...item, sqFt, amount };
    });

    const totalAmount = processedItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = totalAmount * ((tax || 0) / 100);
    const discountAmount = totalAmount * ((discount || 0) / 100);
    const finalAmount = totalAmount + taxAmount - discountAmount;

    const invoice = new Invoice({
      customerId,
      userId: req.user.id,
      items: processedItems,
      totalAmount,
      tax: tax || 0,
      discount: discount || 0,
      finalAmount,
      date: date || new Date(),
    });

    await invoice.save();
    const populated = await invoice.populate('customerId', 'name phone address');
    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateInvoice = async (req, res) => {
  try {
    const { items, tax, discount, date, customerId } = req.body;
    const updateData = {};

    if (customerId) updateData.customerId = customerId;
    if (date) updateData.date = date;

    if (items) {
      const processedItems = items.map((item) => {
        const sqFt = (item.width || 0) * (item.height || 0) * (item.quantity || 1);
        const amount = sqFt > 0 ? sqFt * item.rate : (item.quantity || 1) * item.rate;
        return { ...item, sqFt, amount };
      });

      const totalAmount = processedItems.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = totalAmount * ((tax !== undefined ? tax : 0) / 100);
      const discountAmount = totalAmount * ((discount !== undefined ? discount : 0) / 100);
      const finalAmount = totalAmount + taxAmount - discountAmount;

      updateData.items = processedItems;
      updateData.totalAmount = totalAmount;
      updateData.tax = tax !== undefined ? tax : 0;
      updateData.discount = discount !== undefined ? discount : 0;
      updateData.finalAmount = finalAmount;
    }

    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('customerId', 'name phone address');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    if (!['paid', 'unpaid'].includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { paymentStatus } },
      { new: true }
    ).populate('customerId', 'name phone');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  updatePaymentStatus,
};
