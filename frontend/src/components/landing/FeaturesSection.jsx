import React from 'react';
import { FadeIn } from '../motion/FadeIn';
import { StaggerReveal } from '../motion/StaggerReveal';
import { BarChart3, Globe, LineChart, Shield, Zap } from 'lucide-react';

const features = [
  {
    title: "Real-time Analytics",
    description: "Monitor your emissions globally with sub-second latency and intelligent data streaming.",
    icon: <BarChart3 className="w-6 h-6 text-emerald-500" />,
    colSpan: "md:col-span-2",
  },
  {
    title: "Global Compliance",
    description: "Automated reporting aligned with GHG Protocol and ISO standards.",
    icon: <Globe className="w-6 h-6 text-blue-500" />,
    colSpan: "md:col-span-1",
  },
  {
    title: "Enterprise Security",
    description: "Bank-grade encryption and granular RBAC for your sensitive environmental data.",
    icon: <Shield className="w-6 h-6 text-violet-500" />,
    colSpan: "md:col-span-1",
  },
  {
    title: "Predictive Forecasting",
    description: "Machine learning models project your future footprint based on current trends and reduction goals.",
    icon: <LineChart className="w-6 h-6 text-rose-500" />,
    colSpan: "md:col-span-2",
  }
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
        <div className="mb-16">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              Everything you need to <br className="hidden md:block"/> achieve Net Zero.
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl">
              Powerful tools designed to simplify complex environmental data, giving you the clarity needed to make impactful decisions.
            </p>
          </FadeIn>
        </div>

        <StaggerReveal staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className={`group bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden ${feature.colSpan}`}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
};
