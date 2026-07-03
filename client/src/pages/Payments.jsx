import { useEffect, useState } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { PartyPopper, Phone, CheckCircle2 } from 'lucide-react'

export default function Payments() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  const fetchUnpaid = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/invoices?paymentStatus=unpaid&limit=100')
      setInvoices(res.data.invoices)
    } catch {
      toast.error('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUnpaid() }, [])

  const markPaid = async (id) => {
    setUpdating(id)
    try {
      await api.put(`/api/invoices/${id}/payment`, { paymentStatus: 'paid' })
      toast.success('Invoice marked as paid!')
      setInvoices((prev) => prev.filter((inv) => inv._id !== id))
    } catch {
      toast.error('Update failed')
    } finally {
      setUpdating(null)
    }
  }

  const total = invoices.reduce((s, inv) => s + inv.finalAmount, 0)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Pending Payments</h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
          {invoices.length} unpaid invoice{invoices.length !== 1 ? 's' : ''} — Total: ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </p>
      </div>

      {!loading && invoices.length === 0 && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 sm:p-10 text-center">
          <PartyPopper size={36} className="mx-auto mb-3 text-emerald-500" strokeWidth={1.75} />
          <p className="text-emerald-700 font-semibold font-display">All payments cleared!</p>
          <p className="text-emerald-600 text-sm mt-1">No pending invoices right now.</p>
        </div>
      )}

      {(loading || invoices.length > 0) && (
        <div className="bg-white rounded-2xl shadow-soft border border-slate-200/70">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-brand-600"></div>
            </div>
          ) : (
            <>
              {/* Mobile: card list */}
              <div className="sm:hidden divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <div key={inv._id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 text-sm truncate">{inv.customerId?.name || 'N/A'}</p>
                        {inv.customerId?.phone && (
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                            <Phone size={11} /> {inv.customerId.phone}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 shrink-0">{new Date(inv.date).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                      <span className="font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg text-sm tabular-nums">
                        ₹{inv.finalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                      <button
                        onClick={() => markPaid(inv._id)}
                        disabled={updating === inv._id}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-xs font-semibold px-3.5 py-2 rounded-lg"
                      >
                        <CheckCircle2 size={14} />
                        {updating === inv._id ? 'Updating…' : 'Mark Paid'}
                      </button>
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
                      <th className="px-6 py-3 text-left">Phone</th>
                      <th className="px-6 py-3 text-left">Date</th>
                      <th className="px-6 py-3 text-right">Amount Due</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.map((inv) => (
                      <tr key={inv._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800">{inv.customerId?.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-slate-500">{inv.customerId?.phone || '—'}</td>
                        <td className="px-6 py-4 text-slate-500">{new Date(inv.date).toLocaleDateString('en-IN')}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                            ₹{inv.finalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => markPaid(inv._id)}
                            disabled={updating === inv._id}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                          >
                            {updating === inv._id ? 'Updating…' : 'Mark Paid'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
