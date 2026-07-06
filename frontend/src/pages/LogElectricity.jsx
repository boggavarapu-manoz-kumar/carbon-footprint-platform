import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ActivityService from '../services/ActivityService';
import toast from 'react-hot-toast';
import Bolt from '@mui/icons-material/Bolt';
import SolarPower from '@mui/icons-material/SolarPower';
import WindPower from '@mui/icons-material/WindPower';

const ENERGY_SOURCES = [
  { id: 'GRID_ELEC', name: 'Grid Electricity', icon: <Bolt fontSize="inherit" />, description: 'Standard utility power' },
  { id: 'SOLAR_ELEC', name: 'Solar Panels', icon: <SolarPower fontSize="inherit" />, description: 'Rooftop or community solar' },
  { id: 'RENEWABLE_ELEC', name: 'Renewable Energy', icon: <WindPower fontSize="inherit" />, description: 'Wind, hydro, or green utility plan' }
];

const LogElectricity = () => {
  const navigate = useNavigate();
  
  const [source, setSource] = useState('GRID_ELEC');
  const [kwh, setKwh] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [estimatedCO2, setEstimatedCO2] = useState(0);
  const [calculationBreakdown, setCalculationBreakdown] = useState(null);
  const [calculationError, setCalculationError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounced emission calculation
  useEffect(() => {
    const quantity = parseFloat(kwh);
    if (quantity > 0 && !isNaN(quantity) && source) {
      setIsCalculating(true);
      setCalculationError(null);
      const timer = setTimeout(async () => {
        try {
          const result = await ActivityService.calculateEmission({
            activityType: source,
            quantity: quantity,
            unit: 'kWh',
            dynamicInputs: '{}' // Required by backend validation
          });
          setEstimatedCO2(result.emission.toFixed(2));
          setCalculationBreakdown(result.breakdown);
        } catch (err) {
          console.error('Calculation failed:', err);
          setEstimatedCO2(0);
          setCalculationBreakdown(null);
          setCalculationError("Could not calculate emission. Check your inputs.");
        } finally {
          setIsCalculating(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setEstimatedCO2(0);
      setCalculationBreakdown(null);
      setCalculationError(null);
    }
  }, [kwh, source]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const quantity = parseFloat(kwh);
    
    if (!quantity || quantity <= 0) {
      toast.error('Please enter a valid amount of kWh.');
      return;
    }

    try {
      setIsSubmitting(true);
      await ActivityService.createActivity({
        activityType: source,
        quantity: quantity,
        unit: 'kWh',
        logDate: logDate
      });
      toast.success('Electricity record logged successfully!');
      navigate('/activity-history');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animation-fade-in pb-16 pt-8 px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">Electricity Usage</h1>
        <p className="text-slate-500 text-lg">Log your home or office electricity consumption to track your energy footprint.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          
          {/* Left Side: Form */}
          <div className="flex-1 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-100">
            <form id="electricityForm" onSubmit={handleSubmit} className="space-y-8">
              
              {/* Energy Source Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-4">1. Energy Source</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {ENERGY_SOURCES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSource(s.id)}
                      aria-pressed={source === s.id}
                      className={`relative flex flex-col p-4 rounded-2xl border-2 transition-all text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                        source === s.id
                          ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                          : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`text-3xl mb-3 ${source === s.id ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-500'}`}>{s.icon}</span>
                      <span className={`font-bold text-sm ${source === s.id ? 'text-emerald-900' : 'text-slate-700'}`}>
                        {s.name}
                      </span>
                      <span className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {s.description}
                      </span>
                      {source === s.id && (
                        <div className="absolute top-4 right-4 text-emerald-500">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-4">2. Electricity Consumed</label>
                <div className="relative">
                  <input
                    type="number"
                    value={kwh}
                    onChange={(e) => setKwh(e.target.value)}
                    className="block w-full px-5 py-4 text-2xl font-semibold bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                    placeholder="0.00"
                    required
                    min="0"
                    step="any"
                  />
                  <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-bold text-xl">kWh</span>
                  </div>
                </div>
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">3. Date of Activity</label>
                <input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  required
                />
              </div>

            </form>
          </div>

          {/* Right Side: Real-Time Preview Panel */}
          <div className="lg:w-96 shrink-0 relative z-10 bg-white border-l border-slate-100 p-8 lg:p-10 flex flex-col justify-between">
            <div>
              {/* Clean Professional Header */}
              <div className="pb-6 border-b border-slate-100 mb-6 flex items-center">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3 text-slate-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Carbon Preview</h3>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Real-time Estimate</p>
                </div>
              </div>
              
              <div className="py-6 text-center bg-slate-50 rounded-2xl border border-slate-100 mb-6 transition-all duration-300">
                <div className="relative z-10">
                  {isCalculating ? (
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-12 w-28 bg-slate-200 rounded-lg mb-2"></div>
                      <div className="h-4 w-16 bg-slate-200 rounded"></div>
                    </div>
                  ) : calculationError ? (
                    <div className="flex flex-col items-center justify-center p-4">
                      <div className="text-rose-500 mb-2">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-rose-600 text-center">{calculationError}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center transition-all duration-300">
                      <span
                        aria-live="polite"
                        aria-atomic="true"
                        className="text-5xl font-extrabold text-slate-900 tracking-tight"
                      >{estimatedCO2}</span>
                      <span className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-widest">kg CO₂e</span>
                    </div>
                  )}
                </div>
              </div>

              {calculationBreakdown && (
                <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Calculation Breakdown</h4>
                  <div className="space-y-1.5 text-xs text-slate-600 font-mono">
                    {calculationBreakdown.split('=').map((part, i, arr) => (
                      <div key={i} className={i === arr.length - 1 ? "pt-2 mt-2 border-t border-slate-200 font-bold text-slate-900" : ""}>
                        {i === arr.length - 1 ? `= ${part.trim()}` : part.trim()}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium">Source</span>
                  <span className="font-bold text-slate-900">{ENERGY_SOURCES.find(s => s.id === source)?.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium">Amount</span>
                  <span className="font-bold text-slate-900">{kwh ? `${kwh} kWh` : '-'}</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button
                type="submit"
                form="electricityForm"
                disabled={isSubmitting || !kwh || parseFloat(kwh) <= 0}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/20 transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Record'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LogElectricity;
