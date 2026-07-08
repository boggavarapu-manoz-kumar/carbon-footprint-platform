import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export const ClimateStory = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-10%", once: true });

  return (
    <section id="story" className="py-24 md:py-32 bg-slate-50 relative overflow-hidden">
      
      {/* Decorative Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px] mix-blend-multiply" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] mix-blend-multiply" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-medium text-slate-900 tracking-tight leading-tight mb-8">
            Measure your footprint.<br />
            <span className="text-slate-400">Master your impact.</span>
          </h2>
          
          <p className="text-lg md:text-xl text-slate-600 font-light leading-relaxed max-w-2xl mx-auto">
            The all-in-one platform to seamlessly track, analyze, and reduce your corporate emissions in real time. Built for scale, designed for simplicity.
          </p>
        </motion.div>

      </div>
    </section>
  );
};
