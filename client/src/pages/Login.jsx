import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff, Receipt, ArrowRight } from 'lucide-react'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-slate-50">
      {/* Brand panel — hidden on mobile, shown on desktop */}
      <div className="hidden md:flex md:w-1/2 lg:w-2/5 bg-slate-900 text-white flex-col justify-between p-10 lg:p-14 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-brand-600/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-16 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center font-display font-bold text-xl">S</div>
          <span className="font-display font-bold text-lg tracking-tight">BizFlow</span>
        </div>

        <div className="relative space-y-5">
          <Receipt size={40} className="text-brand-400" strokeWidth={1.5} />
          <h1 className="font-display text-3xl lg:text-4xl font-bold leading-tight">
            Billing, made<br />effortless.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            Create invoices in seconds with automatic area-based pricing, track payments, and see your business grow — all in one place.
          </p>
        </div>

        <p className="relative text-slate-500 text-xs">© 2026 BizFlow. All rights reserved.</p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="md:hidden flex items-center gap-2.5 justify-center mb-8">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center font-display font-bold text-xl text-white">S</div>
            <span className="font-display font-bold text-xl tracking-tight text-slate-900">BizFlow</span>
          </div>

          <div className="mb-7">
            <h1 className="font-display text-2xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-slate-500 text-sm mt-1.5">Sign in to manage your Business and customers.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 transition-shadow"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-11 py-3 border border-slate-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 transition-shadow"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-semibold py-3 rounded-xl transition-colors shadow-pop active:scale-[0.99]"
            >
              {loading ? 'Signing in…' : 'Sign in'}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-7">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-brand-600 hover:text-brand-700 font-semibold">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
