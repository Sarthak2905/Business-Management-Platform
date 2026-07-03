import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, FileText, Wallet, Menu } from "lucide-react";

const tabs = [
  { path: "/dashboard", label: "Home", icon: LayoutDashboard },
  { path: "/invoices", label: "Invoices", icon: FileText },
  { path: "/billing", label: "New Bill", icon: null, primary: true },
  { path: "/customers", label: "Customers", icon: Users },
];

export default function BottomNav({ onMore }) {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 pb-safe-b"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-5 items-end h-16">
        {tabs.slice(0, 2).map((tab) => (
          <TabLink key={tab.path} tab={tab} />
        ))}

        <div className="flex justify-center -translate-y-4">
          <NavLink to="/billing" aria-label="Create new invoice">
            {({ isActive }) => (
              <span
                className={`flex items-center justify-center w-14 h-14 rounded-2xl shadow-pop text-white transition-transform active:scale-95 ${
                  isActive ? "bg-brand-700" : "bg-brand-600"
                }`}
              >
                <Wallet size={24} strokeWidth={2.25} />
              </span>
            )}
          </NavLink>
        </div>

        {tabs.slice(3).map((tab) => (
          <TabLink key={tab.path} tab={tab} />
        ))}

        <button
          onClick={onMore}
          className="flex flex-col items-center justify-center gap-0.5 text-slate-400 h-16 active:text-brand-600"
        >
          <Menu size={20} strokeWidth={2} />
          <span className="text-[10px] font-medium leading-none">More</span>
        </button>
      </div>
    </nav>
  );
}

function TabLink({ tab }) {
  const Icon = tab.icon;
  return (
    <NavLink
      to={tab.path}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center gap-0.5 h-16 transition-colors ${
          isActive ? "text-brand-600" : "text-slate-400"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
          <span className="text-[10px] font-medium leading-none">{tab.label}</span>
        </>
      )}
    </NavLink>
  );
}
