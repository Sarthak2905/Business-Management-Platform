import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { IndianRupee, Clock, Users, FileText, ChevronRight, Plus } from 'lucide-react'

function StatCard({ title, value, icon: Icon, tone, prefix }) {
  const tones = {
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-brand-50 text-brand-600',
    purple: 'bg-violet-50 text-violet-600',
  }
  return (
    <div className="bg-white rounded-2xl shadow-soft border border-slate-200/70 p-4 sm:p-5 flex items-center gap-3.5">
      <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${tones[tone]}`}>
        <Icon size={20} strokeWidth={2.1} />
      </div>
      <div className="min-w-0">
        <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">{title}</p>
        <p className="text-lg sm:text-2xl font-bold text-slate-900 mt-0.5 font-display tabular-nums">
          {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : value}
        </p>
      </div>
    </div>
  )
}

function StatusPill({ status }) {
  const paid = status === 'paid'
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
      paid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
    }`}>
      {paid ? 'Paid' : 'Unpaid'}
    </span>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/analytics/dashboard')
      .then((res) => setStats(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-brand-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Dashboard</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Overview of your business</p>
        </div>
        <Link
          to="/billing"
          className="hidden sm:inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-soft transition-colors"
        >
          <Plus size={16} /> New Invoice
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <StatCard title="Total Sales" value={stats?.totalSales || 0} icon={IndianRupee} tone="green" prefix="₹" />
        <StatCard title="Pending Payments" value={stats?.pendingPayments || 0} icon={Clock} tone="amber" prefix="₹" />
        <StatCard title="Total Customers" value={stats?.totalCustomers || 0} icon={Users} tone="blue" prefix="" />
        <StatCard title="Total Invoices" value={stats?.totalInvoices || 0} icon={FileText} tone="purple" prefix="" />
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-slate-200/70 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 font-display">Recent Invoices</h3>
          <Link to="/invoices" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-0.5">
            View all <ChevronRight size={15} />
          </Link>
        </div>

        {/* Mobile: card list */}
        <div className="sm:hidden divide-y divide-slate-100">
          {(!stats?.recentInvoices || stats.recentInvoices.length === 0) && (
            <p className="px-4 py-10 text-center text-slate-400 text-sm">No invoices yet</p>
          )}
          {stats?.recentInvoices?.map((inv) => (
            <div key={inv._id} className="px-4 py-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-slate-800 text-sm truncate">{inv.customerId?.name || 'N/A'}</p>
                <p className="text-xs text-slate-400 mt-0.5">{new Date(inv.date).toLocaleDateString('en-IN')}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-slate-800 text-sm tabular-nums">₹{inv.finalAmount.toLocaleString('en-IN')}</p>
                <div className="mt-1"><StatusPill status={inv.paymentStatus} /></div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Customer</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentInvoices?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">No invoices yet</td>
                </tr>
              )}
              {stats?.recentInvoices?.map((inv) => (
                <tr key={inv._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3.5 font-medium text-slate-800">{inv.customerId?.name || 'N/A'}</td>
                  <td className="px-6 py-3.5 text-slate-500">{new Date(inv.date).toLocaleDateString('en-IN')}</td>
                  <td className="px-6 py-3.5 text-right font-semibold text-slate-800 tabular-nums">
                    ₹{inv.finalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <StatusPill status={inv.paymentStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
