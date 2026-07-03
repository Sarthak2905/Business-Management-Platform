import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Search, Plus, Pencil, Trash2, ChevronRight, X, Phone } from 'lucide-react'

function CustomerModal({ customer, onClose, onSave }) {
  const [form, setForm] = useState(
    customer || { name: '', phone: '', address: '' }
  )
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (customer?._id) {
        await api.put(`/api/customers/${customer._id}`, form)
        toast.success('Customer updated')
      } else {
        await api.post('/api/customers', form)
        toast.success('Customer added')
      }
      onSave()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-[1px] flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md p-5 sm:p-6 animate-fade-in-up max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-slate-800 font-display">
            {customer?._id ? 'Edit Customer' : 'Add Customer'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 -mr-1">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500"
              placeholder="Customer's full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
            <input
              type="tel"
              inputMode="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500"
              placeholder="10-digit mobile number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={3}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 resize-none"
              placeholder="Shop or delivery address"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white rounded-xl font-medium"
            >
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)

  const fetchCustomers = async (q = '') => {
    try {
      const res = await api.get(`/api/customers?search=${q}`)
      setCustomers(res.data)
    } catch {
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers(search)
  }, [search])

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer and all their invoices?')) return
    try {
      await api.delete(`/api/customers/${id}`)
      toast.success('Customer deleted')
      fetchCustomers(search)
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Customers</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">{customers.length} total customers</p>
        </div>
        <button
          onClick={() => setModal({})}
          className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white px-3.5 sm:px-4 py-2.5 rounded-xl font-medium text-sm shadow-soft"
        >
          <Plus size={16} /> <span className="hidden xs:inline sm:inline">Add Customer</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-slate-200/70">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-sm">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-brand-600"></div>
          </div>
        ) : customers.length === 0 ? (
          <p className="px-6 py-14 text-center text-slate-400 text-sm">No customers found</p>
        ) : (
          <>
            {/* Mobile: card list */}
            <div className="sm:hidden divide-y divide-slate-100">
              {customers.map((c) => (
                <div key={c._id} className="p-4 flex items-center gap-3">
                  <Link to={`/customers/${c._id}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-semibold shrink-0">
                      {c.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 text-sm truncate">{c.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                        {c.phone && <span className="flex items-center gap-1"><Phone size={11} />{c.phone}</span>}
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setModal(c)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg" aria-label="Edit">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(c._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg" aria-label="Delete">
                      <Trash2 size={16} />
                    </button>
                    <Link to={`/customers/${c._id}`} className="p-2 text-slate-300">
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Phone</th>
                    <th className="px-6 py-3 text-left">Address</th>
                    <th className="px-6 py-3 text-left">Joined</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3.5">
                        <Link to={`/customers/${c._id}`} className="font-medium text-brand-600 hover:text-brand-700">
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">{c.phone || '—'}</td>
                      <td className="px-6 py-3.5 text-slate-600 max-w-xs truncate">{c.address || '—'}</td>
                      <td className="px-6 py-3.5 text-slate-500">
                        {new Date(c.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setModal(c)}
                            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"
                            aria-label="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(c._id)}
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

      {modal !== null && (
        <CustomerModal
          customer={modal._id ? modal : null}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchCustomers(search) }}
        />
      )}
    </div>
  )
}
