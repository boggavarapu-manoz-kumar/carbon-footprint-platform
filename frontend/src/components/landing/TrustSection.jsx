import React from 'react';
import { ShieldCheck, FileCheck, Search } from 'lucide-react';

export const TrustSection = () => {
  return (
    <section className="py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-medium text-slate-900 mb-6">Scientific rigor at the core.</h2>
          <p className="text-xl text-slate-600 font-light">We don't estimate. We calculate using verified methodologies approved by global environmental standard bodies.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-8 border border-slate-200 rounded-2xl bg-slate-50 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-emerald-500 mb-6" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">GHG Protocol Aligned</h3>
            <p className="text-slate-600 font-light text-sm">Calculations strictly adhere to the Greenhouse Gas Protocol Corporate Accounting and Reporting Standard.</p>
          </div>
          
          <div className="p-8 border border-slate-200 rounded-2xl bg-slate-50 shadow-sm">
            <Search className="w-8 h-8 text-emerald-500 mb-6" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">EPA & DEFRA Factors</h3>
            <p className="text-slate-600 font-light text-sm">Real-time API integrations with global emission factor databases ensure absolute precision.</p>
          </div>
          
          <div className="p-8 border border-slate-200 rounded-2xl bg-slate-50 shadow-sm">
            <FileCheck className="w-8 h-8 text-emerald-500 mb-6" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Audit-Ready Export</h3>
            <p className="text-slate-600 font-light text-sm">Immutable ledgers and one-click compliance exports for CSRD and SEC climate disclosure rules.</p>
          </div>
          
        </div>

        <div className="mt-20 border-t border-slate-200 pt-10 flex flex-wrap justify-center items-center gap-12 opacity-40 grayscale">
          {/* Mock partner logos */}
          <div className="text-xl font-bold font-serif text-slate-900">SCIENCE BASED TARGETS</div>
          <div className="text-xl font-bold tracking-tighter text-slate-900">GHG PROTOCOL</div>
          <div className="text-xl font-bold font-mono text-slate-900">ISO 14064</div>
          <div className="text-xl font-bold italic text-slate-900">CDP</div>
        </div>

      </div>
    </section>
  );
};
