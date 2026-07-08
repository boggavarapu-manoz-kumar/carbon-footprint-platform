import React from 'react';
import { Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-6 group inline-flex">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">CarbonSync</span>
            </Link>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              The operating system for global climate action. Measure, analyze, and reduce your corporate emissions in real time.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-6">Product</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-slate-500 hover:text-emerald-600 transition-colors">Features</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-emerald-600 transition-colors">Integrations</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-emerald-600 transition-colors">Pricing</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-emerald-600 transition-colors">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-6">Resources</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-slate-500 hover:text-emerald-600 transition-colors">Documentation</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-emerald-600 transition-colors">API Reference</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-emerald-600 transition-colors">Blog</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-emerald-600 transition-colors">Community</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-6">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-slate-500 hover:text-emerald-600 transition-colors">About Us</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-emerald-600 transition-colors">Careers</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-emerald-600 transition-colors">Legal</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-emerald-600 transition-colors">Contact</a></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} CarbonSync Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
