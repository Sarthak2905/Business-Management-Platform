import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts'
import api from '../services/api'
import toast from 'react-hot-toast'

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#0ea5e9']

export default function Analytics() {
  const [period, setPeriod] = useState('monthly')
  const [salesData, setSalesData] = useState([])
  const [topCustomers, setTopCustomers] = useState([])
  const [topItems, setTopItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get(`/api/analytics/sales?period=${period}`),
      api.get('/api/analytics/top-customers'),
      api.get('/api/analytics/top-items'),
    ])
      .then(([sales, customers, items]) => {
        setSalesData(sales.data)
        setTopCustomers(customers.data)
        setTopItems(items.data)
      })
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [period])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-brand-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
          Analytics
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Business performance insights
        </p>
      </div>

      {/* Sales Overview */}
      <div className="bg-white rounded-2xl shadow-soft border border-slate-200/70 p-4 sm:p-6 overflow-hidden">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 font-display">
            Sales Overview
          </h3>

          <div className="flex flex-wrap gap-2">
            {['daily', 'weekly', 'monthly'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-xl capitalize transition-all duration-200 ${
                  period === p
                    ? 'bg-brand-600 text-white shadow-soft'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {salesData.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
            No sales data for this period
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={salesData}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                  stroke="#94a3b8"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#94a3b8"
                  tickFormatter={(v) => `₹${v.toLocaleString('en-IN')}`}
                />
                <Tooltip
                  formatter={(value) => [
                    `₹${value.toLocaleString('en-IN')}`,
                    'Sales',
                  ]}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Customers */}
        <div className="bg-white rounded-2xl shadow-soft border border-slate-200/70 p-4 sm:p-6 overflow-hidden">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 font-display mb-5">
            Top Customers by Revenue
          </h3>

          {topCustomers.length === 0 ? (
            <div className="text-slate-400 text-sm text-center py-8">
              No data yet
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={topCustomers}
                  layout="vertical"
                  margin={{ left: 20, right: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                    stroke="#94a3b8"
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    width={90}
                    stroke="#94a3b8"
                  />
                  <Tooltip
                    formatter={(value) => [
                      `₹${value.toLocaleString('en-IN')}`,
                      'Revenue',
                    ]}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  />

                  <Bar dataKey="totalSpent" radius={[0, 4, 4, 0]}>
                    {topCustomers.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top Items */}
        <div className="bg-white rounded-2xl shadow-soft border border-slate-200/70 p-4 sm:p-6 overflow-hidden">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 font-display mb-5">
            Top Items by Revenue
          </h3>

          {topItems.length === 0 ? (
            <div className="text-slate-400 text-sm text-center py-8">
              No data yet
            </div>
          ) : (
            <div className="space-y-4">
              {topItems.slice(0, 7).map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-xs font-bold text-slate-400 w-5">
                    {i + 1}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                      <span className="text-xs sm:text-sm font-medium text-slate-700 break-words">
                        {item.name}
                      </span>

                      <span className="text-xs sm:text-sm font-semibold text-slate-900 font-display">
                        ₹
                        {item.totalRevenue.toLocaleString('en-IN', {
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            (item.totalRevenue / topItems[0].totalRevenue) * 100
                          }%`,
                          backgroundColor: COLORS[i % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}