const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');

const getCustomers = async (req, res) => {
  try {
    const { search } = req.query;
    const query = { userId: req.user.id };
    if (search) {
      const safeSearch = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { phone: { $regex: safeSearch, $options: 'i' } },
      ];
    }
    const customers = await Customer.find(query).sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, userId: req.user.id });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const createCustomer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const name = String(req.body.name || '').trim();
    const phone = String(req.body.phone || '').trim();
    const address = String(req.body.address || '').trim();
    const customer = new Customer({ name, phone, address, userId: req.user.id });
    await customer.save();
    res.status(201).json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const allowedFields = {};
    if (req.body.name !== undefined) allowedFields.name = String(req.body.name).trim();
    if (req.body.phone !== undefined) allowedFields.phone = String(req.body.phone).trim();
    if (req.body.address !== undefined) allowedFields.address = String(req.body.address).trim();

    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: allowedFields },
      { new: true, runValidators: true }
    );
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    await Invoice.deleteMany({ customerId: req.params.id, userId: req.user.id });
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCustomerHistory = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, userId: req.user.id });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const invoices = await Invoice.find({ customerId: req.params.id, userId: req.user.id }).sort({
      date: -1,
    });

    const totalSpent = invoices
      .filter((inv) => inv.paymentStatus === 'paid')
      .reduce((sum, inv) => sum + inv.finalAmount, 0);

    const pendingDues = invoices
      .filter((inv) => inv.paymentStatus === 'unpaid')
      .reduce((sum, inv) => sum + inv.finalAmount, 0);

    res.json({ customer, invoices, totalSpent, pendingDues });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerHistory,
};
