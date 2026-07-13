import React, { useState, useEffect } from 'react';
import { Search, Calendar, Filter, X } from 'lucide-react';
import { format, subDays, startOfWeek, startOfMonth, startOfYear } from 'date-fns';

const CATEGORIES = ['Transport', 'Electricity', 'Food', 'Shopping', 'Other Activities'];

export const ActivityMonitorFilters = ({ filters, setFilters, onApply }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [datePreset, setDatePreset] = useState('ALL');

  useEffect(() => {
    // Debounce effect for local text search changes could be here,
    // but we use an explicit "Apply" button or just apply on blur for numbers
    const timer = setTimeout(() => {
      onApply(localFilters);
    }, 500);
    return () => clearTimeout(timer);
  }, [localFilters.searchUser, localFilters.activityName]); // Only auto-apply text searches after debounce

  const handleDatePresetChange = (preset) => {
    setDatePreset(preset);
    let startDate = null;
    let endDate = null;
    const now = new Date();
    
    switch (preset) {
      case 'TODAY':
        startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        break;
      case 'YESTERDAY':
        startDate = new Date(subDays(now, 1).setHours(0, 0, 0, 0)).toISOString();
        endDate = new Date(subDays(now, 1).setHours(23, 59, 59, 999)).toISOString();
        break;
      case 'THIS_WEEK':
        startDate = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
        break;
      case 'THIS_MONTH':
        startDate = startOfMonth(now).toISOString();
        break;
      case 'THIS_YEAR':
        startDate = startOfYear(now).toISOString();
        break;
      case 'CUSTOM':
        startDate = localFilters.startDate;
        endDate = localFilters.endDate;
        break;
      default: // ALL
        break;
    }
    
    const newFilters = { ...localFilters, startDate, endDate };
    setLocalFilters(newFilters);
    onApply(newFilters);
  };

  const handleCategoryToggle = (cat) => {
    let cats = localFilters.categories || [];
    if (cats.includes(cat)) {
      cats = cats.filter(c => c !== cat);
    } else {
      cats = [...cats, cat];
    }
    const newFilters = { ...localFilters, categories: cats };
    setLocalFilters(newFilters);
    onApply(newFilters);
  };

  const handleApplyClick = () => {
    onApply(localFilters);
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    let sortBy = 'createdAt';
    let sortDirection = 'DESC';
    if (val === 'EMISSION_DESC') { sortBy = 'carbonEmission'; sortDirection = 'DESC'; }
    if (val === 'EMISSION_ASC') { sortBy = 'carbonEmission'; sortDirection = 'ASC'; }
    if (val === 'CREATED_ASC') { sortBy = 'createdAt'; sortDirection = 'ASC'; }
    
    const newFilters = { ...localFilters, sortBy, sortDirection };
    setLocalFilters(newFilters);
    onApply(newFilters);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 space-y-4">
      {/* Search Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search User by ID, Name, or Email..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            value={localFilters.searchUser || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, searchUser: e.target.value })}
          />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search Activity Name..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            value={localFilters.activityName || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, activityName: e.target.value })}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        {/* Date Preset */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <select 
            value={datePreset}
            onChange={(e) => handleDatePresetChange(e.target.value)}
            className="border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="ALL">All Time</option>
            <option value="TODAY">Today</option>
            <option value="YESTERDAY">Yesterday</option>
            <option value="THIS_WEEK">This Week</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="THIS_YEAR">This Year</option>
            <option value="CUSTOM">Custom Range</option>
          </select>
        </div>

        {datePreset === 'CUSTOM' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
              value={localFilters.startDate ? localFilters.startDate.split('T')[0] : ''}
              onChange={(e) => {
                const newStartDate = e.target.value ? new Date(e.target.value).toISOString() : null;
                const newFilters = { ...localFilters, startDate: newStartDate };
                setLocalFilters(newFilters);
                onApply(newFilters);
              }}
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              className="border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
              value={localFilters.endDate ? localFilters.endDate.split('T')[0] : ''}
              onChange={(e) => {
                const newEndDate = e.target.value ? new Date(e.target.value).setHours(23, 59, 59, 999) : null;
                const newFilters = { ...localFilters, endDate: newEndDate ? new Date(newEndDate).toISOString() : null };
                setLocalFilters(newFilters);
                onApply(newFilters);
              }}
            />
          </div>
        )}

        {/* Sort */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select 
            onChange={handleSortChange}
            className="border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="CREATED_DESC">Newest First</option>
            <option value="CREATED_ASC">Oldest First</option>
            <option value="EMISSION_DESC">Highest Emissions</option>
            <option value="EMISSION_ASC">Lowest Emissions</option>
          </select>
        </div>

        {/* Min/Max Emission */}
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            placeholder="Min kg"
            className="w-24 border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
            value={localFilters.minEmission || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, minEmission: e.target.value ? parseFloat(e.target.value) : null })}
            onBlur={handleApplyClick}
          />
          <span className="text-gray-500">-</span>
          <input 
            type="number" 
            placeholder="Max kg"
            className="w-24 border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
            value={localFilters.maxEmission || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, maxEmission: e.target.value ? parseFloat(e.target.value) : null })}
            onBlur={handleApplyClick}
          />
        </div>
      </div>

      {/* Category Toggles */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
        <span className="text-sm text-gray-500 mr-2 flex items-center">Categories:</span>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategoryToggle(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              (localFilters.categories || []).includes(cat)
                ? 'bg-primary-100 text-primary-800 border border-primary-200'
                : 'bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};
