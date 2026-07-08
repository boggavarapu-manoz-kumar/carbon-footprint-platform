import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Database, ShieldCheck, Activity } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const HeroSection = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden min-h-screen flex items-center bg-[#0A0A0A]">
      {/* Precision Grid Background */}
      <div className="absolute inset-0 bg-[#0A0A0A] pointer-events-none">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 relative z-10 w-full flex flex-col lg:flex-row items-center gap-16">
        
        {/* Text Content */}
        <motion.div 
          style={{ y: y2, opacity }}
          className="text-left w-full lg:w-1/2"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-emerald-400 mb-8 backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Real-time carbon ledger
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tighter leading-[1.05] mb-6"
          >
            Data-driven <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">
              decarbonization.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-slate-400 mb-10 max-w-xl leading-relaxed font-light"
          >
            Stop guessing your emissions. CarbonSync integrates directly with your infrastructure to provide precise, audit-ready carbon telemetry in real-time.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Link 
              to="/register" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black rounded-full font-semibold text-sm hover:bg-slate-200 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
            >
              Start analyzing data <ArrowRight className="w-4 h-4" />
            </Link>
            <a 
              href="#how-it-works" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-white rounded-full font-medium text-sm border border-white/20 hover:bg-white/5 transition-all"
            >
              View API Docs
            </a>
          </motion.div>
        </motion.div>

        {/* Dashboard Mockup / Data Viz */}
        <motion.div 
          style={{ y: y1 }}
          className="w-full lg:w-1/2 relative perspective-1000"
        >
          <motion.div 
            initial={{ opacity: 0, rotateY: -10, rotateX: 10, scale: 0.9 }}
            animate={{ opacity: 1, rotateY: -5, rotateX: 5, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-emerald-500/10 overflow-hidden transform-gpu"
          >
            {/* Mockup Header */}
            <div className="h-10 border-b border-slate-800 flex items-center px-4 gap-2 bg-slate-900/50">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
              </div>
              <div className="mx-auto px-24 py-1 rounded bg-slate-800/50 text-[10px] text-slate-500 font-mono">
                carbonsync.io/dashboard/live
              </div>
            </div>
            
            {/* Mockup Content - Real Data Feel */}
            <div className="p-6 bg-[#0A0A0A]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white text-sm font-semibold">Total Scope Emissions</h3>
                  <p className="text-slate-400 text-xs mt-1">Live telemetry • US-East Region</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-emerald-500 text-xs font-mono">SYNCING</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-slate-400 font-medium">Scope 1 (Direct)</span>
                  </div>
                  <div className="text-2xl font-bold text-white font-mono">1,245.8 <span className="text-sm text-slate-500">tCO2e</span></div>
                  <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '65%' }}
                      transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                      className="h-full bg-emerald-400"
                    ></motion.div>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-slate-400 font-medium">Scope 2 (Energy)</span>
                  </div>
                  <div className="text-2xl font-bold text-white font-mono">3,892.1 <span className="text-sm text-slate-500">tCO2e</span></div>
                  <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '85%' }}
                      transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
                      className="h-full bg-blue-400"
                    ></motion.div>
                  </div>
                </div>
              </div>

              {/* Chart Mockup */}
              <div className="w-full h-32 rounded-xl border border-slate-800 bg-slate-900/50 p-4 relative overflow-hidden flex items-end gap-1">
                {Array.from({ length: 40 }).map((_, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(10, Math.random() * 100)}%` }}
                    transition={{ 
                      duration: 1, 
                      delay: 0.5 + (i * 0.02),
                      ease: "backOut" 
                    }}
                    className={`flex-1 rounded-t-sm ${i > 30 ? 'bg-emerald-500/80' : 'bg-slate-700'}`}
                  ></motion.div>
                ))}
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none"></div>
              </div>
            </div>
          </motion.div>
          
          {/* Floating Elements for Depth */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-6 -left-6 p-4 rounded-xl border border-slate-700 bg-slate-800/90 backdrop-blur-xl shadow-xl flex items-center gap-3 z-20"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-white text-xs font-semibold">ISO 14064 Compliant</p>
              <p className="text-slate-400 text-[10px]">Verified yesterday at 14:02</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
