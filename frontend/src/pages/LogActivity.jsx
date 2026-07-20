import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import ActivityService from '../services/ActivityService';
import OtherActivityService from '../services/OtherActivityService';
import toast from 'react-hot-toast';
import ErrorState from '../components/ErrorState';
import { CheckCircle } from 'lucide-react';
import DirectionsCar from '@mui/icons-material/DirectionsCar';
import Bolt from '@mui/icons-material/Bolt';
import Restaurant from '@mui/icons-material/Restaurant';
import LocalMall from '@mui/icons-material/LocalMall';
import DirectionsBus from '@mui/icons-material/DirectionsBus';
import Train from '@mui/icons-material/Train';
import Flight from '@mui/icons-material/Flight';
import EnergySavingsLeaf from '@mui/icons-material/EnergySavingsLeaf';
import KebabDining from '@mui/icons-material/KebabDining';
import SetMeal from '@mui/icons-material/SetMeal';
import PhoneIphone from '@mui/icons-material/PhoneIphone';
import Checkroom from '@mui/icons-material/Checkroom';
import Home from '@mui/icons-material/Home';
import EnergySavingsLeafOutlined from '@mui/icons-material/EnergySavingsLeafOutlined';

const IconResolver = ({ iconName, className }) => {
  const map = {
    'car': <DirectionsCar className={className} fontSize="inherit" />,
    'zap': <Bolt className={className} fontSize="inherit" />,
    'coffee': <Restaurant className={className} fontSize="inherit" />,
    'shopping-bag': <LocalMall className={className} fontSize="inherit" />,
    '🚗': <DirectionsCar className={className} fontSize="inherit" />,
    '🚌': <DirectionsBus className={className} fontSize="inherit" />,
    '🚆': <Train className={className} fontSize="inherit" />,
    '✈️': <Flight className={className} fontSize="inherit" />,
    '🥗': <EnergySavingsLeaf className={className} fontSize="inherit" />,
    '🌱': <EnergySavingsLeaf className={className} fontSize="inherit" />,
    '🍗': <KebabDining className={className} fontSize="inherit" />,
    '🐟': <SetMeal className={className} fontSize="inherit" />,
    '📱': <PhoneIphone className={className} fontSize="inherit" />,
    '👕': <Checkroom className={className} fontSize="inherit" />,
    '🏠': <Home className={className} fontSize="inherit" />,
    '📦': <LocalMall className={className} fontSize="inherit" />,
  };
  return map[iconName] || <EnergySavingsLeafOutlined className={className} fontSize="inherit" />;
};

const LogActivity = () => {
  const navigate = useNavigate();
  
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Wizard State
  const [step, setStep] = useState(1);
  const queryClient = useQueryClient();

  // Selections
  const [selectedCategoryCode, setSelectedCategoryCode] = useState('');
  const [selectedActivityTypeCode, setSelectedActivityTypeCode] = useState('');
  
  // Dynamic Form Data
  const [formData, setFormData] = useState({});
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Custom Transport State
  const [transportMode, setTransportMode] = useState('');
  const [transportSubSelection, setTransportSubSelection] = useState('');
  
  // Custom Food State
  const [foodMealType, setFoodMealType] = useState('');

  // Custom Shopping State
  const [shoppingType, setShoppingType] = useState('');

  const [isCalculating, setIsCalculating] = useState(false);
  const [estimatedCO2, setEstimatedCO2] = useState(0);
  const [calculationBreakdown, setCalculationBreakdown] = useState(null);
  const [calculationError, setCalculationError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedActivity, setSubmittedActivity] = useState(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const data = await ActivityService.getActivityCatalog();
        setCatalog(data);
      } catch (err) {
        console.error('Failed to load catalog:', err);
        setError('Failed to load activity catalog. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  // Reset dependent state when moving back
  useEffect(() => {
    if (step === 1) {
      setSelectedActivityTypeCode('');
      setTransportMode('');
      setTransportSubSelection('');
      setFoodMealType('');
      setShoppingType('');
      setFormData({});
      setEstimatedCO2(0);
      setCalculationBreakdown(null);
      setCalculationError(null);
    }
    if (step === 2) {
      setFoodMealType('');
      setShoppingType('');
      setFormData({});
      setEstimatedCO2(0);
      setCalculationBreakdown(null);
      setCalculationError(null);
    }
  }, [step]);

  // Derived active items
  const activeCategory = useMemo(() => {
    if (selectedCategoryCode === 'OTHER_ACTIVITIES') {
      return { code: 'OTHER_ACTIVITIES', name: 'Other Activities', icon: '📦' };
    }
    return catalog.find(c => c.code === selectedCategoryCode);
  }, [catalog, selectedCategoryCode]);
  
  // Flatten activity types for easy lookup
  const allActivityTypes = useMemo(() => {
    if (!activeCategory) return [];
    return activeCategory.subCategories?.flatMap(sub => sub.activityTypes || []) || [];
  }, [activeCategory]);
  
  const activeActivityType = useMemo(() => {
    if (activeCategory?.code === 'TRANSPORT') {
      let code = '';
      if (transportMode === 'Car') code = transportSubSelection || 'CAR_PETROL';
      else if (transportMode === 'Flight') code = transportSubSelection || 'FLIGHT_SHORT';
      else if (transportMode === 'Bus') code = 'BUS';
      else if (transportMode === 'Train') code = 'TRAIN';
      else return null;
      return allActivityTypes.find(t => t.code === code) || null;
    }
    if (activeCategory?.code === 'DIET') {
      if (!foodMealType) return null;
      return allActivityTypes.find(t => t.code === foodMealType) || null;
    }
    if (activeCategory?.code === 'SHOPPING') {
      if (!shoppingType) return null;
      return allActivityTypes.find(t => t.code === shoppingType) || null;
    }
    return allActivityTypes.find(t => t.code === selectedActivityTypeCode);
  }, [allActivityTypes, selectedActivityTypeCode, activeCategory, transportMode, transportSubSelection, foodMealType, shoppingType]);

  // Handle dynamic form change
  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  // Debounced emission calculation
  useEffect(() => {
    if (!activeActivityType || !activeActivityType.schema) return;

    const requiredFields = activeActivityType.schema.filter(s => s.isRequired);
    const hasAllRequired = requiredFields.every(f => formData[f.fieldName] && formData[f.fieldName] !== '');
    
    if (hasAllRequired) {
      const numField = activeActivityType.schema.find(s => s.fieldType === 'NUMBER');
      const quantity = numField ? parseFloat(formData[numField.fieldName]) : 1;
      const unit = numField ? numField.unit : '';

      if (quantity > 0 && !isNaN(quantity)) {
        setIsCalculating(true);
        setCalculationError(null);
        const timer = setTimeout(async () => {
          try {
            const result = await ActivityService.calculateEmission({
              activityType: activeActivityType.code,
              quantity: quantity,
              unit: unit || '',
              dynamicInputs: '{}' // Required by backend validation
            });
            setEstimatedCO2(result.emission.toFixed(2));
            setCalculationBreakdown(result.breakdown);
          } catch (err) {
            console.error('Calculation failed:', err);
            setEstimatedCO2(0);
            setCalculationBreakdown(null);
            setCalculationError("Could not calculate emission. Please check your inputs.");
          } finally {
            setIsCalculating(false);
          }
        }, 500);
        return () => clearTimeout(timer);
      }
    } else {
      setEstimatedCO2(0);
      setCalculationBreakdown(null);
      setCalculationError(null);
    }
  }, [formData, activeActivityType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeActivityType) return;
    
    const requiredFields = activeActivityType.schema.filter(s => s.isRequired);
    for (let f of requiredFields) {
      if (!formData[f.fieldName]) {
        toast.error(`Please fill in ${f.fieldName.replace('_', ' ')}`);
        return;
      }
    }

    const numField = activeActivityType.schema.find(s => s.fieldType === 'NUMBER');
    const quantity = numField ? parseFloat(formData[numField.fieldName]) : 1;
    const unit = numField ? numField.unit : '';

    try {
      setIsSubmitting(true);
      const created = await ActivityService.createActivity({
        activityType: activeActivityType.code,
        quantity: quantity,
        unit: unit,
        logDate: logDate
      });
      await queryClient.invalidateQueries();
      toast.success('Activity logged successfully!');
      setSubmittedActivity({
        emission: created.emissionValue,
        name: activeActivityType.name,
        quantity: quantity,
        unit: unit,
        date: logDate
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtherSubmit = async (e) => {
    e.preventDefault();
    if (!formData.activityName || !formData.quantity || !formData.unit) {
      toast.error('Please fill in Activity Name, Quantity, and Unit');
      return;
    }
    try {
      setIsSubmitting(true);
      const created = await OtherActivityService.createLog({
        activityName: formData.activityName,
        activityDescription: formData.activityDescription,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        logDate: logDate,
        logTime: formData.logTime ? (formData.logTime.length === 5 ? formData.logTime + ':00' : formData.logTime) : null,
        carbonValue: formData.carbonValue ? parseFloat(formData.carbonValue) : 0,
        notes: formData.notes
      });
      await queryClient.invalidateQueries();
      toast.success('Custom activity logged successfully!');
      setSubmittedActivity({
        emission: created.carbonValue,
        name: created.activityName,
        quantity: created.quantity,
        unit: created.unit,
        date: created.logDate
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log custom activity');
    } finally {
      setIsSubmitting(false);
    }
  };



  if (loading) {
    return (
      <div className="max-w-6xl mx-auto pb-16 pt-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="h-9 w-48 bg-slate-200 rounded-xl animate-pulse mb-3"></div>
          <div className="h-5 w-96 bg-slate-100 rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-2xl animate-pulse">
              <div className="w-10 h-10 bg-slate-200 rounded-full mb-4"></div>
              <div className="h-4 w-20 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  if (submittedActivity) {
    return (
      <div className="max-w-3xl mx-auto pb-16 pt-12 px-4 sm:px-6 lg:px-8 animation-fade-in flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-xl ring-1 ring-black/5">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        
        <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Activity Successfully Logged</h2>
        <p className="text-slate-500 mb-8 max-w-md">Your carbon footprint has been recalculated and all your goals have been dynamically updated.</p>
        
        <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-8 pb-6 border-b border-slate-100 flex flex-col items-center">
            <div className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Total Estimated Impact</div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black tracking-tighter text-slate-900">{submittedActivity.emission?.toFixed(2) || '0.00'}</span>
              <span className="text-xl font-bold text-slate-400">kg CO₂e</span>
            </div>
          </div>
          
          <div className="bg-slate-50 p-6 flex flex-col gap-4 text-left">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Activity</span>
              <span className="text-slate-900 font-semibold">{submittedActivity.name}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Amount</span>
              <span className="text-slate-900 font-semibold">{submittedActivity.quantity} {submittedActivity.unit}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500 font-medium">Date</span>
              <span className="text-slate-900 font-semibold">{submittedActivity.date}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button 
            onClick={() => {
              setSubmittedActivity(null);
              setFormData({});
              setActiveCategory(null);
              setSelectedActivityTypeCode('');
            }}
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex-1 sm:flex-none text-center"
          >
            Log Another Activity
          </button>
          <button 
            onClick={() => navigate('/dashboard/activities')}
            className="px-8 py-4 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold rounded-2xl border border-slate-200 transition-all flex-1 sm:flex-none text-center"
          >
            View Activity History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animation-fade-in pb-16 pt-8 px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">Log Activity</h1>
        <p className="text-slate-500 text-lg max-w-2xl">Record a new activity to accurately measure and track your carbon footprint over time.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        {/* Left Side: Wizard Flow */}
        <div className="flex-1 space-y-8">
          
          {/* Step 1: Category */}
          <div className={`transition-all duration-300 ${step !== 1 ? 'opacity-60' : 'opacity-100'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm mr-3">1</span>
                Select Category
              </h2>
              {step > 1 && (
                <button onClick={() => setStep(1)} className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Change</button>
              )}
            </div>
            
            {step === 1 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {catalog.map(cat => (
                  <button
                    key={cat.code}
                    onClick={() => {
                      setSelectedCategoryCode(cat.code);
                      setStep(2);
                    }}
                    className="group relative flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  >
                    <span className="text-4xl mb-4 text-slate-400 group-hover:text-emerald-600 group-hover:scale-110 transition-transform">
                      <IconResolver iconName={cat.icon || '🌱'} />
                    </span>
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-700">{cat.name}</span>
                  </button>
                ))}
                
                {/* Custom Other Category */}
                <button
                  onClick={() => {
                    setSelectedCategoryCode('OTHER_ACTIVITIES');
                    setStep(3); // Skip straight to details for custom
                  }}
                  className="group relative flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                >
                  <span className="text-4xl mb-4 text-slate-400 group-hover:text-emerald-600 group-hover:scale-110 transition-transform">
                    <IconResolver iconName="📦" />
                  </span>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-700">Other Activities</span>
                </button>
              </div>
            ) : (
              <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center">
                <span className="text-2xl mr-4 text-emerald-600 flex items-center">
                  <IconResolver iconName={activeCategory?.icon} />
                </span>
                <span className="font-semibold text-slate-900">{activeCategory?.name}</span>
              </div>
            )}
          </div>

          {/* Step 2: Activity Type */}
          {(step >= 2) && (
            <div className={`transition-all duration-300 ${step !== 2 ? 'opacity-60' : 'opacity-100'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm mr-3">2</span>
                  Select Activity Type
                </h2>
                {step > 2 && (
                  <button onClick={() => setStep(2)} className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Change</button>
                )}
              </div>
              
              {step === 2 && activeCategory?.code !== 'OTHER_ACTIVITIES' ? (
                activeCategory?.code === 'TRANSPORT' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {['Car', 'Bus', 'Train', 'Flight'].map(mode => (
                      <button
                        key={mode}
                        onClick={() => {
                          setTransportMode(mode);
                          if (mode === 'Car') setTransportSubSelection('CAR_PETROL');
                          if (mode === 'Flight') setTransportSubSelection('FLIGHT_SHORT');
                          setStep(3);
                        }}
                        aria-pressed={transportMode === mode}
                        className={`group relative flex flex-col items-center justify-center p-6 bg-white border-2 rounded-2xl hover:shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                          transportMode === mode
                            ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                            : 'border-slate-200 hover:border-emerald-400'
                        }`}
                      >
                        <span className={`text-4xl mb-4 group-hover:scale-110 transition-transform ${transportMode === mode ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-500'}`}>
                          <IconResolver iconName={mode === 'Car' ? '🚗' : mode === 'Bus' ? '🚌' : mode === 'Train' ? '🚆' : '✈️'} />
                        </span>
                        <span className={`text-sm font-semibold ${transportMode === mode ? 'text-emerald-700' : 'text-slate-700'}`}>{mode}</span>
                        {transportMode === mode && (
                          <div className="absolute top-2.5 right-2.5 text-emerald-500">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : activeCategory?.code === 'DIET' ? (
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { code: 'MEAL_VEG',     label: 'Vegetarian',  emoji: '🥗', desc: '1.2 kg CO₂e / serving', color: 'green' },
                      { code: 'MEAL_VEGAN',   label: 'Vegan',       emoji: '🌱', desc: '0.8 kg CO₂e / serving', color: 'emerald' },
                      { code: 'MEAL_CHICKEN', label: 'Chicken',     emoji: '🍗', desc: '1.6 kg CO₂e / serving', color: 'amber' },
                      { code: 'MEAL_SEAFOOD', label: 'Seafood',     emoji: '🐟', desc: '1.4 kg CO₂e / serving', color: 'blue' },
                    ].map(meal => (
                      <button
                        key={meal.code}
                        onClick={() => {
                          setFoodMealType(meal.code);
                          setStep(3);
                        }}
                        aria-pressed={foodMealType === meal.code}
                        className={`group relative flex flex-col items-center justify-center p-6 bg-white border-2 rounded-2xl hover:shadow-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 text-center ${
                          foodMealType === meal.code
                            ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                            : 'border-slate-200 hover:border-emerald-400'
                        }`}
                      >
                        {foodMealType === meal.code && (
                          <div className="absolute top-2.5 right-2.5 text-emerald-500">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          </div>
                        )}
                        <span className={`text-4xl mb-3 group-hover:scale-110 transition-transform duration-200 ${foodMealType === meal.code ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-500'}`}>
                          <IconResolver iconName={meal.emoji} />
                        </span>
                        <span className={`text-sm font-bold mb-1 ${foodMealType === meal.code ? 'text-emerald-700' : 'text-slate-800'}`}>{meal.label}</span>
                        <span className="text-xs text-slate-400 font-medium">{meal.desc}</span>
                      </button>
                    ))}
                  </div>
                ) : activeCategory?.code === 'SHOPPING' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { code: 'ELEC_DEVICE',       label: 'Electronics',        emoji: '📱', desc: '55 kg CO₂e / item', badge: 'High Impact',   badgeColor: 'rose' },
                      { code: 'CLOTHING_FAST',      label: 'Clothing',           emoji: '👕', desc: '15 kg CO₂e / item', badge: 'Medium Impact', badgeColor: 'amber' },
                      { code: 'HOUSEHOLD_PRODUCTS', label: 'Household Products', emoji: '🏠', desc: '12 kg CO₂e / item', badge: 'Medium Impact', badgeColor: 'amber' },
                    ].map(item => (
                      <button
                        key={item.code}
                        onClick={() => {
                          setShoppingType(item.code);
                          setStep(3);
                        }}
                        aria-pressed={shoppingType === item.code}
                        className={`group relative flex flex-col items-start p-6 bg-white border-2 rounded-2xl hover:shadow-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                          shoppingType === item.code
                            ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                            : 'border-slate-200 hover:border-emerald-400'
                        }`}
                      >
                        {shoppingType === item.code && (
                          <div className="absolute top-2.5 right-2.5 text-emerald-500">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          </div>
                        )}
                        <span className={`text-4xl mb-4 group-hover:scale-110 transition-transform duration-200 block ${shoppingType === item.code ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-500'}`}>
                          <IconResolver iconName={item.emoji} />
                        </span>
                        <span className={`text-sm font-bold block mb-1 ${shoppingType === item.code ? 'text-emerald-700' : 'text-slate-800'}`}>{item.label}</span>
                        <span className="text-xs text-slate-400 font-medium block mb-3">{item.desc}</span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          item.badgeColor === 'rose'
                            ? 'bg-rose-50 text-rose-700 border border-rose-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>{item.badge}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    {activeCategory?.subCategories?.map(sub => (
                      <div key={sub.code} className="mb-6 last:mb-0">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">{sub.name}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {sub.activityTypes?.map(type => (
                            <button
                              key={type.code}
                              onClick={() => {
                                setSelectedActivityTypeCode(type.code);
                                setStep(3);
                              }}
                              className="flex items-center text-left p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all focus:outline-none"
                            >
                              <div className="flex-1">
                                <div className="font-semibold text-slate-900">{type.name}</div>
                                {type.description && <div className="text-xs text-slate-500 mt-1 line-clamp-1">{type.description}</div>}
                              </div>
                              <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-3">
                  <span className="font-semibold text-slate-900">
                    {activeCategory?.code === 'TRANSPORT'
                      ? transportMode
                      : activeActivityType?.name ?? '—'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Details */}
          {(step >= 3) && (
            <div className="transition-all duration-300 animation-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm mr-3">3</span>
                  Activity Details
                </h2>
                <button onClick={() => setStep(2)} className="text-sm font-medium text-emerald-600 hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500 rounded">Change</button>
              </div>
              
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                {activeCategory?.code === 'OTHER_ACTIVITIES' ? (
                  <form id="activityForm" onSubmit={handleOtherSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="col-span-1 sm:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Activity Name <span className="text-emerald-500">*</span></label>
                        <input type="text" value={formData.activityName || ''} onChange={(e) => handleInputChange('activityName', e.target.value)} required placeholder="e.g. Generator Usage" className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" />
                      </div>
                      <div className="col-span-1 sm:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                        <input type="text" value={formData.activityDescription || ''} onChange={(e) => handleInputChange('activityDescription', e.target.value)} placeholder="Brief description" className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quantity <span className="text-emerald-500">*</span></label>
                        <input type="number" min="0" step="any" value={formData.quantity || ''} onChange={(e) => handleInputChange('quantity', e.target.value)} required placeholder="e.g. 5" className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Unit <span className="text-emerald-500">*</span></label>
                        <input type="text" value={formData.unit || ''} onChange={(e) => handleInputChange('unit', e.target.value)} required placeholder="e.g. Hours, kg" className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date <span className="text-emerald-500">*</span></label>
                        <input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} max={new Date().toISOString().split('T')[0]} required className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Time</label>
                        <input type="time" value={formData.logTime || ''} onChange={(e) => handleInputChange('logTime', e.target.value)} className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" />
                      </div>
                      <div className="col-span-1 sm:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Carbon Value (kg CO₂e)</label>
                        <input type="number" min="0" step="any" value={formData.carbonValue || ''} onChange={(e) => handleInputChange('carbonValue', e.target.value)} placeholder="0.00" className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" />
                        <p className="text-xs text-slate-500 mt-1">Leave blank or 0 if unknown</p>
                      </div>
                      <div className="col-span-1 sm:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes</label>
                        <textarea value={formData.notes || ''} onChange={(e) => handleInputChange('notes', e.target.value)} placeholder="Additional details..." rows="3" className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" />
                      </div>
                    </div>
                  </form>
                ) : (
                <form id="activityForm" onSubmit={handleSubmit} className="space-y-6">
                  
                  {activeCategory?.code === 'TRANSPORT' && transportMode === 'Car' && (
                     <div>
                       <label className="block text-sm font-semibold text-slate-700 mb-1.5">Fuel Type</label>
                       <select 
                         value={transportSubSelection} 
                         onChange={(e) => setTransportSubSelection(e.target.value)}
                         className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                       >
                         <option value="CAR_PETROL">Petrol</option>
                         <option value="CAR_DIESEL">Diesel</option>
                         <option value="EV">Electric Vehicle</option>
                       </select>
                     </div>
                  )}

                  {activeCategory?.code === 'TRANSPORT' && transportMode === 'Flight' && (
                     <div>
                       <label className="block text-sm font-semibold text-slate-700 mb-1.5">Class Type</label>
                       <select 
                         value={transportSubSelection} 
                         onChange={(e) => setTransportSubSelection(e.target.value)}
                         className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                       >
                         <option value="FLIGHT_SHORT">Short Haul (Economy)</option>
                         <option value="FLIGHT_LONG">Long Haul (Business / First)</option>
                       </select>
                     </div>
                  )}



                  {activeActivityType?.schema?.map(field => (
                    <div key={field.fieldName}>
                      <label className="block text-sm font-semibold text-slate-700 capitalize mb-1.5">
                        {field.fieldName.replace('_', ' ')} {field.isRequired && <span className="text-emerald-500">*</span>}
                      </label>
                      <div className="relative">
                        <input
                          type={field.fieldType === 'NUMBER' ? 'number' : 'text'}
                          value={formData[field.fieldName] || ''}
                          onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
                          className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                          placeholder={`Enter ${field.fieldName.replace('_', ' ')}`}
                          required={field.isRequired}
                          min={field.fieldType === 'NUMBER' ? "0" : undefined}
                          step={field.fieldType === 'NUMBER' ? "any" : undefined}
                        />
                        {field.unit && (
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <span className="text-slate-400 font-medium">{field.unit}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <div>
                    <label htmlFor="logDate" className="block text-sm font-semibold text-slate-700 mb-1.5">Date of Activity</label>
                    <input
                      type="date"
                      id="logDate"
                      value={logDate}
                      onChange={(e) => setLogDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                      required
                    />
                  </div>
                </form>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Real-Time Preview Panel */}
        <div className="lg:w-96 shrink-0 relative z-10">
          <div className="sticky top-8 bg-white border border-slate-200 shadow-xl rounded-3xl overflow-hidden">
            
            {/* Clean Professional Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mr-3 text-slate-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Carbon Preview</h3>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Real-time Estimate</p>
              </div>
            </div>
            
            <div className="p-6">
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
                      >{activeCategory?.code === 'OTHER_ACTIVITIES' ? (formData.carbonValue || 0) : estimatedCO2}</span>
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

              <div className="space-y-3 mb-8">
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium">Category</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="text-slate-400"><IconResolver iconName={activeCategory?.icon} className="w-4 h-4" /></span>
                    {activeCategory?.name || '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium">Activity</span>
                  <span className="font-bold text-slate-900">{activeCategory?.code === 'OTHER_ACTIVITIES' ? formData.activityName || '—' : activeActivityType?.name || '—'}</span>
                </div>
              </div>

              <button
                type="submit"
                form="activityForm"
                disabled={step < 3 || isSubmitting || (activeCategory?.code !== 'OTHER_ACTIVITIES' && !activeActivityType)}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/20 transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Logging...' : 'Log Activity'}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Mobile Sticky CO₂ Preview Bar */}
      {step >= 3 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-2xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Live Estimate</p>
              <p className="text-sm font-black text-slate-900" aria-live="polite" aria-atomic="true">
                {isCalculating ? '...' : `${estimatedCO2} kg CO₂e`}
              </p>
            </div>
          </div>
          <button
            type="submit"
            form="activityForm"
            disabled={isSubmitting || !activeActivityType}
            className="py-2.5 px-5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Log Activity'}
          </button>
        </div>
      )}
    </div>
  );
};

export default LogActivity;
