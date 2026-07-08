import React from 'react';
import { motion } from 'framer-motion';
import { MagneticButton } from '../motion/MagneticButton';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FinalCTA = () => {
  return (
    <section className="relative py-40 overflow-hidden bg-slate-50 flex items-center justify-center min-h-[80vh]">
      
      {/* Aurora Background */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <motion.div 
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-full h-[600px] max-w-4xl bg-gradient-to-tr from-emerald-400/20 to-emerald-200/40 blur-[120px] rounded-[100%]"
        ></motion.div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
              x: Math.sin(i) * 50
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            className="absolute bg-emerald-500 rounded-full w-1.5 h-1.5"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: '10%'
            }}
          ></motion.div>
        ))}
      </div>

      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <h2 className="text-5xl md:text-7xl font-medium text-slate-900 tracking-tighter mb-6">
          Start Measuring Your Impact Today.
        </h2>
        <p className="text-xl text-slate-600 font-light mb-12">
          Join a movement towards a greener future. Deploy the CarbonSync platform in minutes.
        </p>

        <MagneticButton damping={15}>
          <Link 
            to="/register"
            className="group flex items-center justify-center gap-2 px-10 py-5 bg-emerald-500 text-white rounded-full font-medium text-lg transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/20"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </MagneticButton>
      </div>
      
    </section>
  );
};
