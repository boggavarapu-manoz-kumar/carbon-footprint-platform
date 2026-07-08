import React from 'react';
import { FadeIn } from '../motion/FadeIn';

const steps = [
  {
    number: "01",
    title: "Connect Your Data",
    description: "Integrate automatically with your utility providers and enterprise systems."
  },
  {
    number: "02",
    title: "AI Analysis",
    description: "Our engine categorizes emissions and identifies high-impact reduction areas."
  },
  {
    number: "03",
    title: "Set Targets",
    description: "Establish science-based targets aligned with your corporate sustainability goals."
  },
  {
    number: "04",
    title: "Track & Report",
    description: "Generate compliant reports and share progress with stakeholders instantly."
  }
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">
              Sustainability, streamlined.
            </h2>
            <p className="text-lg text-slate-600">
              Go from manual spreadsheets to automated intelligence in four simple steps.
            </p>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <FadeIn key={idx} delay={idx * 0.15} direction="up" className="relative">
              <div className="flex flex-col">
                <div className="text-6xl font-extrabold text-slate-100 mb-6 tracking-tighter">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.description}</p>
              </div>
              
              {/* Connector Line (Desktop) */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-slate-100 to-transparent"></div>
              )}
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};
