import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Receipt,
  FileText,
  BarChart3,
  Wallet,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/customers", label: "Customers", icon: Users },
  { path: "/billing", label: "Create Invoice", icon: Receipt },
  { path: "/invoices", label: "Invoices", icon: FileText },
  { path: "/payments", label: "Payments", icon: Wallet },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user } = useAuth();

  return (
    <>
      {/* Overlay (mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-[1px] z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
    fixed top-0 left-0
    z-40
    w-64
    h-screen
    bg-slate-900
    text-white
    flex flex-col
    transform transition-transform duration-300
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0
  `}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center font-display font-bold text-lg shrink-0">
              S
            </div>
            <div>
              <h1 className="font-display font-bold text-[15px] leading-tight tracking-tight">
                BizFlow
              </h1>
              <p className="text-slate-400 text-[11px] leading-tight">
                Business Management Platform
              </p>
            </div>
          </div>
          <button
            className="md:hidden text-slate-400 hover:text-white p-1"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Menu
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive
                  ? "bg-brand-600 text-white shadow-soft"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <item.icon size={18} strokeWidth={2} className="shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-sm font-semibold shrink-0">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
