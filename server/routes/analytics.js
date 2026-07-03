const express = require('express');
const auth = require('../middleware/auth');
const {
  getDashboardStats,
  getSalesChart,
  getTopCustomers,
  getTopItems,
} = require('../controllers/analyticsController');

const router = express.Router();

router.use(auth);

router.get('/dashboard', getDashboardStats);
router.get('/sales', getSalesChart);
router.get('/top-customers', getTopCustomers);
router.get('/top-items', getTopItems);

module.exports = router;
