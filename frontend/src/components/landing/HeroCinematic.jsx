import React from 'react';
import { motion } from 'framer-motion';
import { TextReveal } from '../motion/TextReveal';
import { MagneticButton } from '../motion/MagneticButton';
import { ArrowRight, Play, ArrowDown } from 'lucide-react';

export const HeroCinematic = () => {
  return (
    <section className="relative h-screen min-h-[800px] w-full flex flex-col items-center justify-center overflow-hidden bg-slate-50">
      
      {/* Cinematic Background Elements */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        {/* Animated Earth Visualization (CSS/Motion Proxy) - LIGHT MODE */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className="absolute w-[800px] h-[800px] rounded-full border border-emerald-500/10 opacity-60"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(16, 185, 129, 0.05) 0%, transparent 60%)',
            boxShadow: 'inset 0 0 100px rgba(255,255,255,0.8), 0 0 100px rgba(16, 185, 129, 0.05)'
          }}
        >
          {/* Latitude/Longitude lines mock */}
          <div className="absolute inset-0 border border-emerald-500/10 rounded-full rotate-45 scale-90"></div>
          <div className="absolute inset-0 border border-emerald-500/10 rounded-full -rotate-45 scale-90"></div>
        </motion.div>
        
        {/* Dynamic Lighting Aurora - LIGHT MODE */}
        <motion.div 
          animate={{ 
            opacity: [0.4, 0.6, 0.4],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-1/4 w-[60%] h-[60%] bg-emerald-400/20 blur-[150px] rounded-full mix-blend-multiply"
        ></motion.div>
        <motion.div 
          animate={{ 
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 -right-1/4 w-[60%] h-[60%] bg-emerald-200/40 blur-[150px] rounded-full mix-blend-multiply"
        ></motion.div>

        {/* Particles / Data lines (Simplified) */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(16,185,129,0.1) 1px, transparent 1px)', backgroundSize: '100px 100px', opacity: 0.5 }}></div>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto px-6 pt-20">
        
        <TextReveal 
          text="Track Your Carbon Impact."
          className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tighter text-slate-900 mb-2 justify-center"
        />
        <TextReveal 
          text="Build A Sustainable Future."
          className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-700 mb-8 justify-center"
          delay={0.5}
        />
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto mb-12 font-light"
        >
          CarbonSync is the enterprise platform connecting your operational data to real-time climate intelligence. Measure, manage, and act.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <MagneticButton>
            <a href="/register" className="group flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 text-white rounded-full font-medium text-sm transition-all hover:bg-emerald-600 shadow-xl shadow-emerald-500/20">
              Start Tracking
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </MagneticButton>
          
          <MagneticButton damping={20}>
            <a href="#story" className="group flex items-center justify-center gap-2 px-8 py-4 bg-white/50 backdrop-blur-md text-slate-700 rounded-full font-medium text-sm border border-slate-200 transition-all hover:bg-white hover:shadow-sm">
              <Play className="w-4 h-4 text-emerald-500 group-hover:text-emerald-600 transition-colors" />
              See How It Works
            </a>
          </MagneticButton>
        </motion.div>
      </div>

      {/* Animated Arrow Down Button */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20"
      >
        <a href="#story" className="flex items-center justify-center w-12 h-12 rounded-full bg-white/80 backdrop-blur border border-slate-200 text-emerald-500 hover:text-emerald-600 hover:bg-white hover:scale-110 transition-all shadow-lg hover:shadow-xl group">
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="w-5 h-5 group-hover:stroke-[3px]" />
          </motion.div>
        </a>
      </motion.div>
    </section>
  );
};
