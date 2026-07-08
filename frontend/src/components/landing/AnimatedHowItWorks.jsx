import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { UserPlus, Activity, Calculator, PieChart, TreePine } from 'lucide-react';

const steps = [
  { id: 1, title: "Create Account", desc: "Instantly deploy your secure workspace.", icon: UserPlus },
  { id: 2, title: "Track Activities", desc: "Connect APIs or log travel, energy, and supply chain data.", icon: Activity },
  { id: 3, title: "Calculate Emissions", desc: "Real-time, audited GHG conversion metrics.", icon: Calculator },
  { id: 4, title: "View Insights", desc: "Cinematic, interactive data visualization.", icon: PieChart },
  { id: 5, title: "Take Action", desc: "AI-driven reduction recommendations.", icon: TreePine }
];

export const AnimatedHowItWorks = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-20%" });

  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        
        <div className="mb-24 md:text-center">
          <h2 className="text-4xl md:text-5xl font-medium text-slate-900 tracking-tight mb-4">A seamless workflow.</h2>
          <p className="text-xl text-slate-600 font-light">From raw data to verified climate action in minutes.</p>
        </div>

        <div ref={ref} className="relative">
          {/* Connection Line */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-200 -translate-y-1/2 hidden lg:block"></div>
          <motion.div 
            initial={{ width: "0%" }}
            animate={isInView ? { width: "100%" } : { width: "0%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute top-1/2 left-0 h-[1px] bg-emerald-500 -translate-y-1/2 hidden lg:block"
          ></motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-6 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div 
                  key={step.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                  transition={{ duration: 0.8, delay: idx * 0.3, type: "spring", bounce: 0.4 }}
                  className="relative flex flex-col items-center text-center group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0)] group-hover:shadow-[0_10px_30px_rgba(16,185,129,0.1)] group-hover:border-emerald-300 transition-all duration-500 z-10 relative overflow-hidden">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={isInView ? { scale: 1 } : { scale: 0 }}
                      transition={{ delay: (idx * 0.3) + 0.2, type: "spring" }}
                      className="absolute inset-0 bg-emerald-50"
                    ></motion.div>
                    <Icon className="w-6 h-6 text-slate-600 group-hover:text-emerald-500 transition-colors z-10" />
                  </div>
                  
                  <div className="hidden lg:block absolute top-8 left-1/2 w-full h-[1px]"></div>

                  <h3 className="text-lg font-medium text-slate-900 mb-2">Step {step.id}: {step.title}</h3>
                  <p className="text-sm text-slate-500 font-light leading-relaxed max-w-[200px]">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
