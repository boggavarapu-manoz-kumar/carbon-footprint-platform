import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../core/AuthContext';
import { NotificationCenter } from './NotificationCenter';

export const TopNavbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const { logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Cmd+K global search listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button 
        type="button" 
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true"></div>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        
        {/* Global Search */}
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">Search</label>
          <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400" aria-hidden="true" />
          <input
            id="search-field"
            ref={searchInputRef}
            className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm transition-all"
            placeholder="Search resources... (Cmd+K)"
            type="search"
            name="search"
          />
          <div className="absolute inset-y-0 right-0 hidden sm:flex items-center pointer-events-none">
            <kbd className="inline-flex items-center rounded border border-gray-200 px-1 font-sans text-xs text-gray-400">
              <abbr title="Command" className="no-underline">⌘</abbr>K
            </kbd>
          </div>
        </form>

        {/* Right side utilities */}
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          
          <NotificationCenter />

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true"></div>

          {/* Profile dropdown */}
          <div className="relative">
            <button 
              type="button" 
              className="-m-1.5 flex items-center p-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center border border-primary-200 text-primary-700 font-semibold text-sm">
                A
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-4 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
                  Admin User
                </span>
                <ChevronDown className="ml-2 h-4 w-4 text-gray-400" aria-hidden="true" />
              </span>
            </button>
            
            {showProfileMenu && (
              <div className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-black/5 focus:outline-none transition ease-out duration-100 transform opacity-100 scale-100">
                <a href="#profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <User className="mr-3 h-4 w-4 text-gray-400" />
                  Your Profile
                </a>
                <a href="#settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Settings className="mr-3 h-4 w-4 text-gray-400" />
                  Settings
                </a>
                <div className="my-1 border-t border-gray-100"></div>
                <button 
                  onClick={handleLogout}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="mr-3 h-4 w-4 text-red-500" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
