import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight, Leaf } from 'lucide-react';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className={`fixed top-0 inset-x-0 z-[60] transition-all duration-500 ${
          scrolled 
            ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/50 py-3 shadow-sm' 
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-300 group-hover:scale-105">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">CarbonSync</span>
          </Link>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4 ml-auto">
            <Link 
              to="/login"
              className="text-sm font-semibold text-slate-600 hover:text-emerald-600 px-4 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/register"
              className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-600 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
            >
              <span className="relative z-10">Start Tracking</span>
              <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 z-0 bg-gradient-to-r from-emerald-600 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-slate-600 hover:text-emerald-600 transition-colors p-2 ml-auto"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-[70] bg-white p-6 md:hidden flex flex-col"
          >
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900">CarbonSync</span>
              </div>
              <button 
                className="text-slate-500 hover:text-slate-900 transition-colors p-2 bg-slate-100 rounded-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-auto flex flex-col gap-4">
              <Link 
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-4 rounded-xl font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200"
              >
                Sign In
              </Link>
              <Link 
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-4 rounded-xl font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
              >
                Start Tracking
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
