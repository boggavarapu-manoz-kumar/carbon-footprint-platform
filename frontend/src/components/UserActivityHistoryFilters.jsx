import React, { useState } from 'react';
import { format, subDays, startOfWeek, startOfMonth, startOfYear } from 'date-fns';

export const UserActivityHistoryFilters = ({ onFilterChange, categoriesList }) => {
  const [dateRange, setDateRange] = useState('All');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [minEmission, setMinEmission] = useState('');
  const [maxEmission, setMaxEmission] = useState('');
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const predefinedRanges = ['All', 'Today', 'Yesterday', 'This Week', 'This Month', 'This Year', 'Custom Date Range'];
  const allCategories = categoriesList || ['Transport', 'Electricity', 'Food', 'Shopping', 'Other'];

  const applyFilters = (updates) => {
    onFilterChange({
      startDate: updates.startDate !== undefined ? updates.startDate : customStartDate,
      endDate: updates.endDate !== undefined ? updates.endDate : customEndDate,
      categories: updates.categories !== undefined ? updates.categories : categories,
      searchActivityName: updates.search !== undefined ? updates.search : search,
      minEmission: updates.minEmission !== undefined ? updates.minEmission : minEmission,
      maxEmission: updates.maxEmission !== undefined ? updates.maxEmission : maxEmission
    });
  };

  const handleDateRangeChange = (e) => {
    const range = e.target.value;
    setDateRange(range);
    
    let start = '';
    let end = '';
    const today = new Date();

    if (range === 'Today') {
      start = format(today, 'yyyy-MM-dd');
      end = format(today, 'yyyy-MM-dd');
    } else if (range === 'Yesterday') {
      const yesterday = subDays(today, 1);
      start = format(yesterday, 'yyyy-MM-dd');
      end = format(yesterday, 'yyyy-MM-dd');
    } else if (range === 'This Week') {
      start = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      end = format(today, 'yyyy-MM-dd');
    } else if (range === 'This Month') {
      start = format(startOfMonth(today), 'yyyy-MM-dd');
      end = format(today, 'yyyy-MM-dd');
    } else if (range === 'This Year') {
      start = format(startOfYear(today), 'yyyy-MM-dd');
      end = format(today, 'yyyy-MM-dd');
    }

    if (range !== 'Custom Date Range') {
      setCustomStartDate(start);
      setCustomEndDate(end);
      applyFilters({ startDate: start, endDate: end });
    }
  };

  const toggleCategory = (cat) => {
    let newCats;
    if (categories.includes(cat)) {
      newCats = categories.filter(c => c !== cat);
    } else {
      newCats = [...categories, cat];
    }
    setCategories(newCats);
    applyFilters({ categories: newCats });
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    applyFilters({ search: e.target.value });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 transition-all duration-300 ease-in-out">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        
        {/* Search */}
        <div className="relative w-full md:w-1/3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search activities..."
            value={search}
            onChange={handleSearch}
            className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 sm:text-sm transition-colors"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
          >
            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Advanced Filters {categories.length > 0 && <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">{categories.length}</span>}
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {isFilterOpen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
          
          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={handleDateRangeChange}
              className="block w-full pl-3 pr-10 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 mb-3"
            >
              {predefinedRanges.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            {dateRange === 'Custom Date Range' && (
              <div className="flex gap-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => {
                    setCustomStartDate(e.target.value);
                    applyFilters({ startDate: e.target.value });
                  }}
                  className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                />
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => {
                    setCustomEndDate(e.target.value);
                    applyFilters({ endDate: e.target.value });
                  }}
                  className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Categories</label>
            <div className="flex flex-wrap gap-2">
              {allCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    categories.includes(cat)
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Emission Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Carbon Emission (kg CO₂)</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Min"
                value={minEmission}
                onChange={(e) => {
                  setMinEmission(e.target.value);
                  applyFilters({ minEmission: e.target.value });
                }}
                className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
              />
              <span className="text-slate-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxEmission}
                onChange={(e) => {
                  setMaxEmission(e.target.value);
                  applyFilters({ maxEmission: e.target.value });
                }}
                className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
