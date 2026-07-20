import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';

const AppLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon, exact: true },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChartIcon },
    { name: 'Goals', path: '/dashboard/goals', icon: TargetIcon },
    { name: 'Log Activity', path: '/dashboard/log-activity', icon: PlusIcon },
    { name: 'Activity History', path: '/dashboard/activity-history', icon: ListIcon },
    { name: 'Profile Settings', path: '/dashboard/profile', icon: UserIcon },
  ];

  const SidebarComponent = () => {
    return (
      <div className="h-full flex flex-col">
        {/* Sidebar Header */}
        <div className="h-14 flex items-center px-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="CarbonSync Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-900">CarbonSync</span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Main Menu</p>
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-slate-100 text-slate-900' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#FBFBFC] font-sans text-slate-900 overflow-hidden w-full">
      
      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
          {/* Mobile Menu */}
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-[#FAFAFA] border-r border-slate-200 shadow-xl flex flex-col transform transition-transform translate-x-0">
            <SidebarComponent />
          </aside>
        </div>
      )}

      {/* Desktop Sidebar (Always Visible on md+) */}
      <aside className="hidden md:flex flex-col w-64 bg-[#FAFAFA] border-r border-slate-200 h-full flex-shrink-0 shadow-sm relative z-10">
        <SidebarComponent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative w-full bg-[#FBFBFC]">
        
        {/* Top Navbar Component */}
        <Navbar onOpenSidebar={() => setIsSidebarOpen(true)} />

        {/* Page Content wrapped in Outlet */}
        <main className="flex-1 overflow-y-auto w-full p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Icons
const HomeIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
);
const PlusIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
);
const ListIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
);
const UserIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);
const LeafIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
);
const SearchIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
);
const BellIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
);
const BarChartIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
);
const TargetIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" /><circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="2" fill="currentColor" /></svg>
);

export default AppLayout;
