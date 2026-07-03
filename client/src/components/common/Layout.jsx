import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import { useState } from "react";

export default function Layout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="md:pl-64">
        <Navbar setIsOpen={setIsOpen} />

        <main className="p-4 md:p-6 pb-24 md:pb-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <BottomNav onMore={() => setIsOpen(true)} />
    </div>
  );
}
