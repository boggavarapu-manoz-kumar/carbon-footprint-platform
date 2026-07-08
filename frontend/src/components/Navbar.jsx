import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { getAvatarUrl } from '../utils/formatters';

const Navbar = ({ onOpenSidebar }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [navAvatarError, setNavAvatarError] = useState(false);
  const { data: userProfile } = useProfile();

  const isProfileIncomplete = userProfile && (!userProfile.username || !userProfile.mobileNumber || !userProfile.gender);

  const navAvatarUrl = getAvatarUrl(userProfile?.profilePictureUrl);
  const navFallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent((userProfile?.firstName || 'U') + '+' + (userProfile?.lastName || ''))}&background=10b981&color=fff&size=64&bold=true`;

  return (
    <header className="h-14 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 sticky top-0 flex-shrink-0 transition-all">

      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Sidebar Toggle */}
        <button
          className="md:hidden text-slate-500 hover:text-slate-900 focus:outline-none transition-colors"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>

        {/* Search Bar */}
        <div className="relative w-full max-w-md hidden sm:block group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input
            type="text"
            placeholder="Search activities, settings..."
            className="block w-full pl-9 pr-3 py-1.5 border border-transparent rounded-md leading-5 bg-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 sm:text-sm transition-all text-slate-900 shadow-sm"
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
            <span className="text-xs font-semibold text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 bg-white">⌘K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-4">
        {/* Notifications */}
        <div className="flex items-center">
          {isProfileIncomplete && (
            <div className="hidden sm:flex items-center gap-1.5 mr-3 px-2.5 py-1 bg-rose-50 border border-rose-100 rounded-full animate-pulse">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span className="text-[10px] font-medium text-rose-600 uppercase tracking-wider">Setup Required</span>
            </div>
          )}
          <button className="relative p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors focus:outline-none">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </button>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 focus:outline-none hover:opacity-80 transition-opacity"
            aria-haspopup="true"
            aria-expanded={isProfileOpen}
          >
            <div className="relative">
              <img
                key={navAvatarUrl}
                className="h-8 w-8 rounded-full border border-slate-200 bg-slate-100 object-cover shadow-sm"
                src={navAvatarError ? navFallbackUrl : navAvatarUrl}
                alt="Avatar"
                onError={() => setNavAvatarError(true)}
                onLoad={() => setNavAvatarError(false)}
              />
              {isProfileIncomplete && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-white"></span>
                </span>
              )}
            </div>
          </button>

          {isProfileOpen && (
            <>
              {/* Invisible backdrop to catch outside clicks */}
              <div className="fixed inset-0 z-30 cursor-default" onClick={() => setIsProfileOpen(false)}></div>

              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-1 ring-1 ring-slate-900/5 z-40 transform origin-top-right transition-all">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-900 truncate">{(userProfile?.firstName || 'User') + (userProfile?.lastName ? ' ' + userProfile?.lastName : '')}</p>
                  <p className="text-xs font-medium text-slate-500 truncate">{userProfile?.email || ''}</p>
                </div>

                <div className="py-1">
                  {isProfileIncomplete ? (
                    <button
                      onClick={() => { setIsProfileOpen(false); navigate('/complete-profile'); }}
                      className="flex w-full items-center px-4 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 transition-colors"
                    >
                      <svg className="mr-3 h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      ⚠ Profile Incomplete
                    </button>
                  ) : (
                    <div className="flex w-full items-center px-4 py-2 text-sm text-emerald-600 bg-emerald-50/50">
                      <svg className="mr-3 h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      ✓ Profile Complete
                    </div>
                  )}
                  <button
                    onClick={() => { setIsProfileOpen(false); navigate('/profile'); }}
                    className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <svg className="mr-3 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Settings
                  </button>
                </div>

                <div className="border-t border-slate-100 py-1">
                  <button
                    onClick={() => { setIsProfileOpen(false); logout(); }}
                    className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg className="mr-3 h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
