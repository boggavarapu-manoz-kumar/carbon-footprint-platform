import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Activity, ArrowUpRight, BarChart3, CloudRain } from 'lucide-react';

export const DashboardTilt = () => {
  const ref = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, { damping: 20, stiffness: 100 });
  
  const rotateX = useTransform(smoothProgress, [0, 0.5, 1], [40, 0, -40]);
  const scale = useTransform(smoothProgress, [0, 0.5, 1], [0.95, 1, 0.95]);
  const y = useTransform(smoothProgress, [0, 0.5, 1], [100, 0, -100]);
  const opacity = useTransform(smoothProgress, [0, 0.25, 0.75, 1], [0, 1, 1, 0]);

  return (
    <section ref={ref} className="py-24 md:py-32 bg-slate-50 overflow-hidden perspective-[2500px] relative">
      <div className="max-w-7xl mx-auto px-6 text-center mb-16 md:mb-20 relative z-10">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-slate-900 tracking-tight mb-4">Real-time Climate Analytics.</h2>
        <p className="text-lg md:text-xl text-slate-600 font-light max-w-2xl mx-auto">Track daily emissions, forecast trends, and command your data with unparalleled clarity.</p>
      </div>

      <motion.div 
        style={{ rotateX, scale, y, opacity, transformStyle: "preserve-3d" }}
        className="max-w-6xl mx-auto px-4 sm:px-6 relative"
      >
        {/* Main Dashboard Mockup */}
        <div className="w-full rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col relative z-20 aspect-auto lg:aspect-[16/10]">
          
          {/* Header */}
          <div className="h-12 md:h-14 border-b border-slate-100 flex items-center justify-between px-4 md:px-6 bg-white z-10">
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-slate-200"></div>
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-slate-200"></div>
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-slate-200"></div>
              </div>
              <span className="ml-2 md:ml-4 text-xs md:text-sm font-semibold text-slate-400">CarbonSync Analytics</span>
            </div>
            <div className="flex items-center gap-1 md:gap-2 bg-emerald-50 px-2 py-1 md:px-3 md:py-1 rounded-full border border-emerald-100">
              <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
              <span className="text-[10px] md:text-xs font-bold tracking-wide text-emerald-600 uppercase">Live Sync</span>
            </div>
          </div>
          
          {/* Dashboard Grid */}
          <div className="flex-1 bg-slate-50 p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 overflow-hidden relative">
            
            {/* Left Column (KPIs) */}
            <div className="lg:col-span-4 flex flex-col gap-4 md:gap-6">
              
              <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 shadow-sm">
                <div className="flex justify-between items-start mb-2 md:mb-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                    <CloudRain className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <span className="text-[10px] md:text-xs font-semibold bg-red-50 text-red-600 px-2 py-1 rounded-md flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> +12%</span>
                </div>
                <h3 className="text-[10px] md:text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">Daily Emissions</h3>
                <div className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tighter">4,285<span className="text-xs md:text-base text-slate-400 ml-1 font-normal tracking-normal">kgCO₂e</span></div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 shadow-sm">
                <div className="flex justify-between items-start mb-2 md:mb-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <BarChart3 className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <span className="text-[10px] md:text-xs font-semibold bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md flex items-center gap-1">On Track</span>
                </div>
                <h3 className="text-[10px] md:text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">Monthly Goal</h3>
                <div className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tighter">82<span className="text-xs md:text-base text-slate-400 ml-1 font-normal tracking-normal">%</span></div>
                <div className="w-full bg-slate-100 h-1.5 md:h-2 rounded-full mt-2 md:mt-4 overflow-hidden">
                  <div className="bg-emerald-500 w-[82%] h-full rounded-full"></div>
                </div>
              </div>

            </div>

            {/* Right Column (Big Chart) */}
            <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-6 flex flex-col min-h-[250px] lg:min-h-0">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm md:text-lg">Emissions Trend (30 Days)</h3>
                  <p className="text-xs md:text-sm text-slate-500">Total operational output across all sectors.</p>
                </div>
                <div className="flex gap-3 md:gap-4">
                  <div className="flex items-center gap-1 md:gap-2">
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded bg-emerald-400"></div>
                    <span className="text-[10px] md:text-xs font-medium text-slate-600">Scope 1</span>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2">
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded bg-emerald-200"></div>
                    <span className="text-[10px] md:text-xs font-medium text-slate-600">Scope 2</span>
                  </div>
                </div>
              </div>
              
              {/* Beautiful SVG Chart Mockup */}
              <div className="flex-1 relative w-full h-full flex items-end">
                <svg viewBox="0 0 1000 300" className="w-full h-full preserve-3d overflow-visible" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="50" x2="1000" y2="50" stroke="#f1f5f9" strokeWidth="2" />
                  <line x1="0" y1="150" x2="1000" y2="150" stroke="#f1f5f9" strokeWidth="2" />
                  <line x1="0" y1="250" x2="1000" y2="250" stroke="#f1f5f9" strokeWidth="2" />
                  
                  {/* Scope 2 (Background Area) */}
                  <path 
                    d="M 0 300 L 0 200 C 100 180, 200 250, 300 220 C 400 190, 500 150, 600 180 C 700 210, 800 120, 900 140 C 950 150, 1000 100, 1000 100 L 1000 300 Z" 
                    fill="url(#gradient-scope2)" 
                  />
                  
                  {/* Scope 1 (Foreground Area) */}
                  <path 
                    d="M 0 300 L 0 250 C 100 230, 200 280, 300 260 C 400 240, 500 200, 600 220 C 700 240, 800 180, 900 190 C 950 195, 1000 160, 1000 160 L 1000 300 Z" 
                    fill="url(#gradient-scope1)" 
                  />

                  {/* Gradient Definitions */}
                  <defs>
                    <linearGradient id="gradient-scope1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="gradient-scope2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Data Points */}
                  <circle cx="800" cy="180" r="6" fill="white" stroke="#10b981" strokeWidth="3" className="drop-shadow-md" />
                  <circle cx="1000" cy="160" r="6" fill="white" stroke="#10b981" strokeWidth="3" className="drop-shadow-md" />
                </svg>

                {/* X Axis Labels */}
                <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[10px] md:text-xs text-slate-400 font-medium">
                  <span>Week 1</span>
                  <span>Week 2</span>
                  <span>Week 3</span>
                  <span>Week 4</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15)_0%,transparent_60%)] blur-3xl -z-10 pointer-events-none" style={{ transform: 'translateZ(-100px)' }}></div>
      </motion.div>
    </section>
  );
};
