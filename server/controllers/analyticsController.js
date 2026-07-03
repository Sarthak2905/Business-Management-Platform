const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [paidInvoices, unpaidInvoices, totalCustomers, recentInvoices] = await Promise.all([
      Invoice.find({ userId, paymentStatus: 'paid' }).select('finalAmount'),
      Invoice.find({ userId, paymentStatus: 'unpaid' }).select('finalAmount'),
      Customer.countDocuments({ userId }),
      Invoice.find({ userId })
        .sort({ date: -1 })
        .limit(5)
        .populate('customerId', 'name'),
    ]);

    const totalSales = paidInvoices.reduce((sum, inv) => sum + inv.finalAmount, 0);
    const pendingPayments = unpaidInvoices.reduce((sum, inv) => sum + inv.finalAmount, 0);
    const totalInvoices = paidInvoices.length + unpaidInvoices.length;

    res.json({
      totalSales,
      pendingPayments,
      totalCustomers,
      totalInvoices,
      recentInvoices,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getSalesChart = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    const userId = req.user.id;

    let groupBy;
    let dateFilter;
    const now = new Date();

    if (period === 'daily') {
      dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
      groupBy = {
        year: { $year: '$date' },
        month: { $month: '$date' },
        day: { $dayOfMonth: '$date' },
      };
    } else if (period === 'weekly') {
      dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 83);
      groupBy = {
        year: { $year: '$date' },
        week: { $week: '$date' },
      };
    } else {
      dateFilter = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      groupBy = {
        year: { $year: '$date' },
        month: { $month: '$date' },
      };
    }

    const sales = await Invoice.aggregate([
      {
        $match: {
          userId: require('mongoose').Types.ObjectId.createFromHexString(userId),
          paymentStatus: 'paid',
          date: { $gte: dateFilter },
        },
      },
      {
        $group: {
          _id: groupBy,
          total: { $sum: '$finalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } },
    ]);

    const formatted = sales.map((s) => {
      let label;
      if (period === 'daily') {
        label = `${s._id.year}-${String(s._id.month).padStart(2, '0')}-${String(s._id.day).padStart(2, '0')}`;
      } else if (period === 'weekly') {
        label = `${s._id.year}-W${String(s._id.week).padStart(2, '0')}`;
      } else {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        label = `${monthNames[s._id.month - 1]} ${s._id.year}`;
      }
      return { label, total: s.total, count: s.count };
    });

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTopCustomers = async (req, res) => {
  try {
    const userId = req.user.id;

    const topCustomers = await Invoice.aggregate([
      {
        $match: {
          userId: require('mongoose').Types.ObjectId.createFromHexString(userId),
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: '$customerId',
          totalSpent: { $sum: '$finalAmount' },
          invoiceCount: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customer',
        },
      },
      { $unwind: '$customer' },
      {
        $project: {
          name: '$customer.name',
          phone: '$customer.phone',
          totalSpent: 1,
          invoiceCount: 1,
        },
      },
    ]);

    res.json(topCustomers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTopItems = async (req, res) => {
  try {
    const userId = req.user.id;

    const topItems = await Invoice.aggregate([
      {
        $match: {
          userId: require('mongoose').Types.ObjectId.createFromHexString(userId),
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          totalRevenue: { $sum: '$items.amount' },
          totalQty: { $sum: '$items.quantity' },
          totalSqFt: { $sum: '$items.sqFt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $project: {
          name: '$_id',
          totalRevenue: 1,
          totalQty: 1,
          totalSqFt: 1,
          count: 1,
        },
      },
    ]);

    res.json(topItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDashboardStats, getSalesChart, getTopCustomers, getTopItems };
