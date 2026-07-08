import React from 'react';
import { FadeIn } from '../motion/FadeIn';
import { motion } from 'framer-motion';

export const CTASection = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-slate-900 to-blue-900/40 opacity-80"></div>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <FadeIn>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">
            Ready to reduce your impact?
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Join forward-thinking companies measuring and managing their environmental footprint with CarbonSync.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="/register" 
              className="w-full sm:w-auto px-8 py-4 bg-emerald-500 text-white rounded-full font-bold text-base hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/25"
            >
              Start for free
            </a>
            <a 
              href="/login" 
              className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white rounded-full font-medium text-base border border-white/20 hover:bg-white/20 transition-all active:scale-95 backdrop-blur-sm"
            >
              Sign in to dashboard
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
