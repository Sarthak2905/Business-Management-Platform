import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Plus, CheckCircle2, RotateCcw, Trash2 } from 'lucide-react'

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

export default function Invoices() {
  const [data, setData] = useState({ invoices: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState([])
  const [filters, setFilters] = useState({ customerId: '', paymentStatus: '' })

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.customerId) params.set('customerId', filters.customerId)
      if (filters.paymentStatus) params.set('paymentStatus', filters.paymentStatus)
      const res = await api.get(`/api/invoices?${params}`)
      setData(res.data)
    } catch {
      toast.error('Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    api.get('/api/customers').then((res) => setCustomers(res.data)).catch(() => {})
  }, [])

  useEffect(() => { fetchInvoices() }, [filters])

  const handleDelete = async (id) => {
    if (!confirm('Delete this invoice?')) return
    try {
      await api.delete(`/api/invoices/${id}`)
      toast.success('Invoice deleted')
      fetchInvoices()
    } catch {
      toast.error('Delete failed')
    }
  }

  const handleMarkPaid = async (id, current) => {
    try {
      const newStatus = current === 'paid' ? 'unpaid' : 'paid'
      await api.put(`/api/invoices/${id}/payment`, { paymentStatus: newStatus })
      toast.success(`Marked as ${newStatus}`)
      fetchInvoices()
    } catch {
      toast.error('Update failed')
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Invoices</h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">{data.total} total invoices</p>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-slate-200/70">
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-2.5">
          <select
            value={filters.customerId}
            onChange={(e) => setFilters({ ...filters, customerId: e.target.value })}
            className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 bg-white"
          >
            <option value="">All Customers</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <select
            value={filters.paymentStatus}
            onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
            className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 bg-white"
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
          <Link
            to="/billing"
            className="ml-auto inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white px-3.5 sm:px-4 py-2.5 rounded-xl font-medium text-sm shadow-soft"
          >
            <Plus size={16} /> <span className="hidden xs:inline">New Invoice</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-brand-600"></div>
          </div>
        ) : data.invoices.length === 0 ? (
          <p className="px-6 py-14 text-center text-slate-400 text-sm">No invoices found</p>
        ) : (
          <>
            {/* Mobile: card list */}
            <div className="sm:hidden divide-y divide-slate-100">
              {data.invoices.map((inv) => (
                <div key={inv._id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 text-sm truncate">{inv.customerId?.name || 'N/A'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{new Date(inv.date).toLocaleDateString('en-IN')}</p>
                    </div>
                    <StatusPill status={inv.paymentStatus} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Subtotal ₹{inv.totalAmount.toLocaleString('en-IN')} · Tax {inv.tax}% · Disc. {inv.discount}%</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                    <p className="font-bold text-slate-800 tabular-nums">₹{inv.finalAmount.toLocaleString('en-IN')}</p>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleMarkPaid(inv._id, inv.paymentStatus)}
                        className="flex items-center gap-1 text-xs font-medium text-brand-600 px-2.5 py-1.5 rounded-lg hover:bg-brand-50"
                      >
                        {inv.paymentStatus === 'paid' ? <RotateCcw size={13} /> : <CheckCircle2 size={13} />}
                        {inv.paymentStatus === 'paid' ? 'Unpaid' : 'Mark Paid'}
                      </button>
                      <button
                        onClick={() => handleDelete(inv._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        aria-label="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
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
                    <th className="px-6 py-3 text-right">Subtotal</th>
                    <th className="px-6 py-3 text-right">Tax</th>
                    <th className="px-6 py-3 text-right">Disc.</th>
                    <th className="px-6 py-3 text-right">Final</th>
                    <th className="px-6 py-3 text-center">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.invoices.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-slate-800">{inv.customerId?.name || 'N/A'}</td>
                      <td className="px-6 py-3.5 text-slate-500">{new Date(inv.date).toLocaleDateString('en-IN')}</td>
                      <td className="px-6 py-3.5 text-right text-slate-600">₹{inv.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-3.5 text-right text-slate-500">{inv.tax}%</td>
                      <td className="px-6 py-3.5 text-right text-slate-500">{inv.discount}%</td>
                      <td className="px-6 py-3.5 text-right font-semibold text-slate-800">₹{inv.finalAmount.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-3.5 text-center"><StatusPill status={inv.paymentStatus} /></td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleMarkPaid(inv._id, inv.paymentStatus)}
                            className="text-xs font-medium text-brand-600 hover:bg-brand-50 px-2 py-1.5 rounded-lg"
                          >
                            {inv.paymentStatus === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                          </button>
                          <button
                            onClick={() => handleDelete(inv._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            aria-label="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
