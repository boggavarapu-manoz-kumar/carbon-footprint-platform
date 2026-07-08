import React, { useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Plane, Zap, Truck } from 'lucide-react';

export const ImpactCalculator = () => {
  const [flights, setFlights] = useState(12);
  const [electricity, setElectricity] = useState(5000);
  const [fleet, setFleet] = useState(5);

  const flightImpact = flights * 0.15;
  const electricityImpact = electricity * 12 * 0.0004;
  const fleetImpact = fleet * 4.6;
  const total = flightImpact + electricityImpact + fleetImpact;

  // Spring animations for the total number
  const springConfig = { damping: 25, stiffness: 150 };
  const animatedTotal = useSpring(total, springConfig);
  const animatedFlight = useSpring(flightImpact, springConfig);
  const animatedElec = useSpring(electricityImpact, springConfig);
  const animatedFleet = useSpring(fleetImpact, springConfig);

  // Update springs when state changes
  useEffect(() => {
    animatedTotal.set(total);
    animatedFlight.set(flightImpact);
    animatedElec.set(electricityImpact);
    animatedFleet.set(fleetImpact);
  }, [total, flightImpact, electricityImpact, fleetImpact, animatedTotal, animatedFlight, animatedElec, animatedFleet]);

  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-emerald-50/80 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-16 relative z-10">
        
        <div className="text-center mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-semibold mb-6 shadow-sm"
          >
            <Zap className="w-4 h-4 fill-emerald-500" />
            Interactive Calculator
          </motion.div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-slate-900 tracking-tight mb-6">Estimate Your Footprint</h2>
          <p className="text-xl text-slate-600 font-light max-w-2xl mx-auto">See how operational choices directly impact your annual carbon emissions using real-time EPA conversion factors.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
          
          {/* Sliders */}
          <div className="w-full lg:w-1/2 space-y-10">
            <SliderControl 
              icon={Plane}
              label="Annual Flights" 
              desc="Short-haul commercial flights"
              value={flights} 
              max={100} 
              unit="flights"
              onChange={(e) => setFlights(Number(e.target.value))} 
            />
            
            <SliderControl 
              icon={Zap}
              label="Facility Electricity" 
              desc="Average monthly consumption"
              value={electricity} 
              max={50000} 
              unit="kWh"
              onChange={(e) => setElectricity(Number(e.target.value))} 
            />
            
            <SliderControl 
              icon={Truck}
              label="Corporate Fleet" 
              desc="Gasoline powered vehicles"
              value={fleet} 
              max={50} 
              unit="vehicles"
              onChange={(e) => setFleet(Number(e.target.value))} 
            />
          </div>

          {/* Visualization */}
          <div className="w-full lg:w-1/2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", bounce: 0.2 }}
              className="bg-slate-900 rounded-[2rem] p-8 md:p-12 relative overflow-hidden shadow-2xl shadow-slate-900/20 text-white"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>
              
              <div className="mb-12 relative z-10">
                <p className="text-sm text-slate-400 font-mono mb-4 font-medium tracking-widest uppercase">Projected Annual Footprint</p>
                <div className="text-6xl md:text-8xl font-light font-mono text-white flex items-baseline gap-3 tracking-tighter">
                  <AnimatedNumber value={animatedTotal} />
                  <span className="text-2xl md:text-3xl text-emerald-500 font-sans tracking-normal font-medium">tCO₂e</span>
                </div>
              </div>

              {/* Dynamic Chart */}
              <div className="h-48 md:h-56 w-full flex items-end gap-3 md:gap-6 relative z-10">
                <Bar height={(flightImpact / total) * 100} color="from-emerald-300 to-emerald-500" label="Flights" value={animatedFlight} percentage={(flightImpact / total) * 100} />
                <Bar height={(electricityImpact / total) * 100} color="from-emerald-400 to-emerald-600" label="Energy" value={animatedElec} percentage={(electricityImpact / total) * 100} />
                <Bar height={(fleetImpact / total) * 100} color="from-emerald-500 to-emerald-700" label="Fleet" value={animatedFleet} percentage={(fleetImpact / total) * 100} />
              </div>

            </motion.div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    return value.on("change", (latest) => {
      setDisplayValue(latest);
    });
  }, [value]);

  return <span>{displayValue.toFixed(1)}</span>;
};

const SliderControl = ({ icon: Icon, label, desc, value, max, unit, onChange }) => (
  <div className="group">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
        <Icon className="w-5 h-5 fill-emerald-100" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <label className="text-lg font-semibold text-slate-900">{label}</label>
          <span className="text-sm font-mono font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">{value.toLocaleString()} {unit}</span>
        </div>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>
    </div>
    <div className="relative pt-2">
      <input 
        type="range" 
        min="0" 
        max={max} 
        value={value} 
        onChange={onChange}
        className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:border-[4px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(16,185,129,0.5)] hover:[&::-webkit-slider-thumb]:scale-110 transition-all"
      />
    </div>
  </div>
);

const Bar = ({ height, color, label, value, percentage }) => {
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    return value.on("change", (latest) => {
      setDisplayVal(latest);
    });
  }, [value]);

  return (
    <div className="flex-1 flex flex-col justify-end h-full group relative">
      {/* Tooltip */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 text-center bg-white text-slate-900 text-xs px-3 py-1.5 rounded-lg whitespace-nowrap z-20 pointer-events-none translate-y-2 group-hover:translate-y-0 shadow-xl font-bold border border-slate-200">
        {displayVal.toFixed(1)} t
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-slate-200 rotate-45"></div>
      </div>
      
      <div className="text-center mb-3 text-xs font-mono text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
        {Math.round(percentage || 0)}%
      </div>
      
      <motion.div 
        layout
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`w-full rounded-t-xl bg-gradient-to-t ${color} relative overflow-hidden shadow-lg shadow-emerald-500/20 cursor-pointer`}
        style={{ height: `${Math.max(8, height)}%` }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.3),transparent)]"></div>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/20 transition-opacity"></div>
      </motion.div>
      
      <div className="text-center mt-4 text-sm text-slate-300 font-medium tracking-wide">{label}</div>
    </div>
  );
}
