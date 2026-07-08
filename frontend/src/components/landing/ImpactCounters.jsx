import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';

export const ImpactCounters = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 bg-white border-y border-slate-200 relative overflow-hidden">
      <div ref={ref} className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl font-medium text-slate-900 tracking-tight">Built for the Indian Market</h2>
          <p className="text-slate-500 mt-2">Integrating local power grid data for accurate, real-time measurements.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-slate-200">
          
          <CounterItem 
            label="Active Facilities Tracked" 
            endValue={450} 
            suffix="+"
            active={isInView} 
            color="text-emerald-500" 
          />
          <CounterItem 
            label="State Grids Integrated" 
            endValue={28} 
            suffix=""
            active={isInView} 
            color="text-slate-900" 
          />
          <CounterItem 
            label="Data Points (Daily)" 
            endValue={2.4} 
            suffix="M"
            active={isInView} 
            color="text-emerald-600" 
          />
          
        </div>
      </div>
    </section>
  );
};

const CounterItem = ({ label, endValue, suffix, active, color }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (active) {
      let start = 0;
      const duration = 2000;
      const increment = endValue / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= endValue) {
          setValue(endValue);
          clearInterval(timer);
        } else {
          setValue(start);
        }
      }, 16);
      
      return () => clearInterval(timer);
    }
  }, [active, endValue]);

  const displayValue = endValue % 1 !== 0 
    ? value.toFixed(1) 
    : Math.floor(value).toLocaleString();

  return (
    <div className="flex flex-col items-center py-6 md:py-0">
      <div className={`text-5xl lg:text-7xl font-light font-mono mb-4 tracking-tighter ${color}`}>
        {displayValue}<span className="opacity-80 ml-1">{suffix}</span>
      </div>
      <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest">{label}</div>
    </div>
  );
};
