import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Menu, LogOut } from "lucide-react";

export default function Navbar({ setIsOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const initial = user?.name?.charAt(0).toUpperCase() || "U";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur border-b border-slate-200 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Menu */}
        <button
          className="md:hidden -ml-1 p-1.5 text-slate-600 rounded-lg hover:bg-slate-100"
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div className="min-w-0">
          <p className="text-[11px] md:text-xs text-slate-400 leading-tight">{greeting}</p>
          <h2 className="font-display font-semibold text-slate-800 text-sm md:text-base leading-tight truncate">
            {user?.name}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <div className="hidden sm:flex items-center gap-2.5 pr-2 border-r border-slate-200 mr-1">
          <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white font-semibold text-sm">
            {initial}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium text-slate-800">{user?.name}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-500 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
