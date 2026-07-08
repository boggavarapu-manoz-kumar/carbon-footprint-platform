import React from 'react';
import { Navbar } from '../components/landing/Navbar';
import { HeroCinematic } from '../components/landing/HeroCinematic';
import { ClimateStory } from '../components/landing/ClimateStory';
import { ImpactCalculator } from '../components/landing/ImpactCalculator';
import { DashboardTilt } from '../components/landing/DashboardTilt';
import { FinalCTA } from '../components/landing/FinalCTA';
import { Footer } from '../components/landing/Footer';

const LandingPage = () => {
  return (
    <div className="bg-white text-slate-900 font-sans selection:bg-emerald-500/30 selection:text-emerald-900 min-h-screen relative overflow-x-hidden">
      <Navbar />
      
      <main>
        <HeroCinematic />
        <ClimateStory />
        <ImpactCalculator />
        <DashboardTilt />
        <FinalCTA />
      </main>
      
      <Footer />
    </div>
  );
};

export default LandingPage;
