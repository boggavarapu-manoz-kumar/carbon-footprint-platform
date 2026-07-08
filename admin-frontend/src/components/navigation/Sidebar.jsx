import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Settings, ShieldAlert, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../core/AuthContext';

const NAVIGATION = [
  { name: 'Dashboard', href: '/', icon: Home, allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT', 'AUDITOR'] },
  { name: 'User Management', href: '/users', icon: Users, allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT'] },
  { name: 'Audit Logs', href: '/audit-logs', icon: ShieldAlert, allowedRoles: ['SUPER_ADMIN', 'AUDITOR'] },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'AUDITOR'] },
  { name: 'System Settings', href: '/settings', icon: Settings, allowedRoles: ['SUPER_ADMIN'] },
];

export const Sidebar = ({ isCollapsed, onToggleCollapse, isMobileOpen, onMobileClose }) => {
  const location = useLocation();
  const { hasRole } = useAuth();

  const filteredNav = NAVIGATION.filter(item => hasRole(item.allowedRoles));

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/80 backdrop-blur-sm lg:hidden transition-opacity" 
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Component */}
      <div className={`
        fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between px-6 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-8 w-8 rounded-lg bg-primary-500 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-semibold text-white tracking-tight whitespace-nowrap animate-in fade-in duration-200">
                Admin Console
              </span>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-1 flex-col overflow-y-auto pt-6 px-3 no-scrollbar" aria-label="Sidebar">
          {!isCollapsed && (
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
              Management
            </div>
          )}
          
          <ul role="list" className="flex flex-1 flex-col gap-y-1">
            {filteredNav.map((item) => {
              const isActive = location.pathname === item.href;
              
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`
                      group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-all
                      ${isActive 
                        ? 'bg-primary-500/10 text-primary-400' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <div className={`
                      relative flex shrink-0 items-center justify-center
                      ${isActive ? 'text-primary-400' : 'text-slate-400 group-hover:text-white'}
                    `}>
                      <item.icon className="h-5 w-5" aria-hidden="true" />
                      {isActive && (
                        <div className={`absolute -left-3 h-8 w-1 rounded-r-full bg-primary-500 ${isCollapsed ? '-left-[14px]' : ''}`} />
                      )}
                    </div>
                    
                    {!isCollapsed && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer Toggle (Desktop Only) */}
        <div className="hidden lg:flex shrink-0 border-t border-slate-800 p-4">
          <button
            onClick={onToggleCollapse}
            className={`flex w-full items-center text-slate-400 hover:text-white transition-colors p-2 rounded-md hover:bg-slate-800 ${isCollapsed ? 'justify-center' : 'justify-between'}`}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {!isCollapsed && <span className="text-sm font-medium">Collapse</span>}
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </>
  );
};
