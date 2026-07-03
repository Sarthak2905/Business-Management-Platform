import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { ChevronLeft, Phone, MapPin, TrendingUp, AlertCircle } from 'lucide-react'

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

export default function CustomerDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/api/customers/${id}/history`)
      .then((res) => setData(res.data))
      .catch(() => toast.error('Failed to load customer details'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-brand-600"></div>
      </div>
    )
  }

  if (!data) return <div className="text-slate-500">Customer not found</div>

  const { customer, invoices, totalSpent, pendingDues } = data

  return (
    <div className="space-y-5 sm:space-y-6">
      <Link to="/customers" className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm font-medium">
        <ChevronLeft size={16} /> Customers
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-soft md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-lg shrink-0">
              {customer.name?.charAt(0).toUpperCase()}
            </div>
            <h3 className="font-semibold text-slate-800 font-display truncate">{customer.name}</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2.5 text-slate-600">
              <Phone size={15} className="text-slate-400 shrink-0" />
              <span>{customer.phone || 'No phone on file'}</span>
            </div>
            <div className="flex items-start gap-2.5 text-slate-600">
              <MapPin size={15} className="text-slate-400 shrink-0 mt-0.5" />
              <span>{customer.address || 'No address on file'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-soft flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <TrendingUp size={19} />
          </div>
          <p className="text-slate-500 text-sm">Total Spent (Paid)</p>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1 font-display tabular-nums">₹{totalSpent.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-soft flex flex-col items-center justify-center text-center">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${pendingDues > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
            <AlertCircle size={19} />
          </div>
          <p className="text-slate-500 text-sm">Pending Dues</p>
          <p className={`text-2xl sm:text-3xl font-bold mt-1 font-display tabular-nums ${pendingDues > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
            ₹{pendingDues.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-slate-200/70 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 font-display">Purchase History ({invoices.length})</h3>
        </div>

        {invoices.length === 0 ? (
          <p className="px-6 py-10 text-center text-slate-400 text-sm">No invoices yet</p>
        ) : (
          <>
            {/* Mobile: card list */}
            <div className="sm:hidden divide-y divide-slate-100">
              {invoices.map((inv) => (
                <div key={inv._id} className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">{new Date(inv.date).toLocaleDateString('en-IN')}</p>
                    <StatusPill status={inv.paymentStatus} />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-slate-400">Tax {inv.tax}% · Discount {inv.discount}%</p>
                    <p className="font-bold text-slate-800 tabular-nums">₹{inv.finalAmount.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-right">Subtotal</th>
                    <th className="px-6 py-3 text-right">Tax</th>
                    <th className="px-6 py-3 text-right">Discount</th>
                    <th className="px-6 py-3 text-right">Final Amount</th>
                    <th className="px-6 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3.5 text-slate-600">{new Date(inv.date).toLocaleDateString('en-IN')}</td>
                      <td className="px-6 py-3.5 text-right text-slate-700">₹{inv.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-3.5 text-right text-slate-500">{inv.tax}%</td>
                      <td className="px-6 py-3.5 text-right text-slate-500">{inv.discount}%</td>
                      <td className="px-6 py-3.5 text-right font-semibold text-slate-800">₹{inv.finalAmount.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-3.5 text-center"><StatusPill status={inv.paymentStatus} /></td>
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
