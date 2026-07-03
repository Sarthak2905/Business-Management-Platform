import { useEffect, useState } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Plus, Trash2, Receipt } from 'lucide-react'

const emptyItem = () => ({ name: '', width: '', height: '', quantity: 1, rate: '', sqFt: 0, amount: 0 })

const fieldCls =
  'w-full px-2.5 py-2 border border-slate-200 rounded-lg text-sm text-right focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500'

export default function Billing() {
  const [customers, setCustomers] = useState([])
  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState([emptyItem()])
  const [tax, setTax] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/api/customers').then((res) => setCustomers(res.data)).catch(() => {})
  }, [])

  const recalcItem = (item) => {
    const w = parseFloat(item.width) || 0
    const h = parseFloat(item.height) || 0
    const q = parseFloat(item.quantity) || 1
    const r = parseFloat(item.rate) || 0
    const sqFt = w * h * q
    const amount = sqFt > 0 ? sqFt * r : q * r
    return { ...item, sqFt: parseFloat(sqFt.toFixed(4)), amount: parseFloat(amount.toFixed(2)) }
  }

  const updateItem = (index, field, value) => {
    const updated = items.map((item, i) => {
      if (i !== index) return item
      const newItem = { ...item, [field]: value }
      return recalcItem(newItem)
    })
    setItems(updated)
  }

  const addItem = () => setItems([...items, emptyItem()])
  const removeItem = (index) => {
    if (items.length === 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const subtotal = items.reduce((s, it) => s + (it.amount || 0), 0)
  const taxAmount = subtotal * (tax / 100)
  const discountAmount = subtotal * (discount / 100)
  const finalAmount = subtotal + taxAmount - discountAmount

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!customerId) return toast.error('Please select a customer')
    if (items.some((it) => !it.name || !it.rate)) return toast.error('Fill all item fields')
    setLoading(true)
    try {
      await api.post('/api/invoices', { customerId, items, tax, discount, date })
      toast.success('Invoice created successfully!')
      setCustomerId('')
      setItems([emptyItem()])
      setTax(0)
      setDiscount(0)
      setDate(new Date().toISOString().split('T')[0])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create invoice')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6 pb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
          <Receipt size={19} />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Create Invoice</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Fill in the details to generate a new invoice</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-soft p-4 sm:p-6">
          <h3 className="font-semibold text-slate-800 mb-4 font-display">Invoice Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Customer *</label>
              <select
                required
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 bg-white"
              >
                <option value="">Select customer…</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-soft p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 font-display">Items</h3>
            <button type="button" onClick={addItem} className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium">
              <Plus size={15} /> Add Row
            </button>
          </div>

          {/* Mobile: stacked item cards */}
          <div className="sm:hidden space-y-3">
            {items.map((item, i) => (
              <div key={i} className="border border-slate-200 rounded-xl p-3.5 space-y-3 bg-slate-50/60">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(i, 'name', e.target.value)}
                    placeholder="Item name"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 bg-white"
                  />
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg shrink-0" aria-label="Remove item">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1 uppercase">Width</label>
                    <input type="number" value={item.width} onChange={(e) => updateItem(i, 'width', e.target.value)} placeholder="0" min="0" className={fieldCls} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1 uppercase">Height</label>
                    <input type="number" value={item.height} onChange={(e) => updateItem(i, 'height', e.target.value)} placeholder="0" min="0" className={fieldCls} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1 uppercase">Qty</label>
                    <input type="number" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} placeholder="1" min="1" className={fieldCls} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1 uppercase">Rate ₹</label>
                    <input type="number" value={item.rate} onChange={(e) => updateItem(i, 'rate', e.target.value)} placeholder="0" min="0" step="0.01" className={fieldCls} />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-sm">
                  <span className="text-slate-500">Sq.Ft: <span className="font-medium text-slate-700">{item.sqFt}</span></span>
                  <span className="font-bold text-slate-800 tabular-nums">₹{item.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-500 text-xs uppercase">
                <tr>
                  <th className="pb-2 text-left pr-3 min-w-[140px]">Item Name</th>
                  <th className="pb-2 text-right pr-3 w-20">Width</th>
                  <th className="pb-2 text-right pr-3 w-20">Height</th>
                  <th className="pb-2 text-right pr-3 w-20">Qty</th>
                  <th className="pb-2 text-right pr-3 w-24">Rate (₹)</th>
                  <th className="pb-2 text-right pr-3 w-24">Sq.Ft</th>
                  <th className="pb-2 text-right w-28">Amount (₹)</th>
                  <th className="pb-2 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-2 pr-3">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(i, 'name', e.target.value)}
                        placeholder="Item name"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input type="number" value={item.width} onChange={(e) => updateItem(i, 'width', e.target.value)} placeholder="0" min="0" className={fieldCls} />
                    </td>
                    <td className="py-2 pr-3">
                      <input type="number" value={item.height} onChange={(e) => updateItem(i, 'height', e.target.value)} placeholder="0" min="0" className={fieldCls} />
                    </td>
                    <td className="py-2 pr-3">
                      <input type="number" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} placeholder="1" min="1" className={fieldCls} />
                    </td>
                    <td className="py-2 pr-3">
                      <input type="number" value={item.rate} onChange={(e) => updateItem(i, 'rate', e.target.value)} placeholder="0.00" min="0" step="0.01" className={fieldCls} />
                    </td>
                    <td className="py-2 pr-3 text-right text-slate-500 text-xs">{item.sqFt}</td>
                    <td className="py-2 text-right font-medium text-slate-800">
                      ₹{item.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 pl-2">
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(i)} className="text-slate-300 hover:text-rose-500">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-soft p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5 sm:items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tax (%)</label>
              <input
                type="number"
                value={tax}
                onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.1"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Discount (%)</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.1"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500"
              />
            </div>
            <div className="col-span-2 sm:col-span-1 bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="tabular-nums">₹{subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax ({tax}%)</span>
                <span className="tabular-nums">+₹{taxAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Discount ({discount}%)</span>
                <span className="tabular-nums">-₹{discountAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-2">
                <span>Final Amount</span>
                <span className="tabular-nums">₹{finalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky mobile total + submit bar */}
        <div className="sm:hidden fixed bottom-16 left-0 right-0 z-30 bg-white/95 backdrop-blur border-t border-slate-200 px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] text-slate-400 leading-tight">Total</p>
            <p className="font-bold text-slate-900 leading-tight tabular-nums">₹{finalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 max-w-[220px] px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-semibold rounded-xl transition-colors shadow-pop"
          >
            {loading ? 'Creating…' : 'Create Invoice'}
          </button>
        </div>

        <div className="hidden sm:flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-semibold rounded-xl transition-colors shadow-soft"
          >
            {loading ? 'Creating…' : 'Create Invoice'}
          </button>
        </div>

        {/* Spacer so the sticky mobile bar never covers the last field */}
        <div className="sm:hidden h-16" aria-hidden="true" />
      </form>
    </div>
  )
}
