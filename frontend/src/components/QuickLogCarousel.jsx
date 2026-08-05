import React, { useState, useEffect, useRef } from 'react';
import QuickLogCard from './QuickLogCard';
import quickLogApi from '../services/quickLogApi';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

const QuickLogCarousel = ({ onSelect }) => {
  const [quickLogs, setQuickLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const fetchQuickLogs = async () => {
    try {
      setLoading(true);
      const data = await quickLogApi.getQuickLogs();
      setQuickLogs(data);
    } catch (err) {
      console.error('Failed to fetch quick logs:', err);
    } finally {
      setLoading(false);
      handleScroll();
    }
  };

  useEffect(() => {
    fetchQuickLogs();
  }, []);

  const handleTogglePin = async (log) => {
    try {
      if (log.isPinned) {
        await quickLogApi.unpinActivity(log.id);
        toast.success(`Unpinned ${log.name}`);
      } else {
        await quickLogApi.pinActivity(log.activityTypeId, log.dynamicInputs);
        toast.success(`Pinned ${log.name}`);
      }
      fetchQuickLogs(); // Refresh the list
    } catch (err) {
      toast.error('Failed to update pin status');
      console.error(err);
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, [quickLogs, searchQuery]);

  const scrollBy = (amount) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const filteredLogs = quickLogs.filter(log => 
    log.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.category && log.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading && quickLogs.length === 0) {
    return (
      <div className="animate-pulse flex gap-4 overflow-x-hidden p-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 w-48 rounded-xl bg-slate-200 flex-shrink-0" />
        ))}
      </div>
    );
  }

  if (quickLogs.length === 0) return null;

  return (
    <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Quick Log</h2>
          <p className="text-sm text-slate-500">Smart suggestions based on your history and habits</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Find an activity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 sm:w-64"
          />
        </div>
      </div>

      <div className="relative group">
        {showLeftArrow && (
          <button 
            onClick={() => scrollBy(-300)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md border border-slate-200 text-slate-600 hover:text-primary-600 hover:bg-slate-50 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft />
          </button>
        )}
        
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {filteredLogs.map((log, idx) => (
            <div key={`${log.id || log.activityTypeId}_${idx}`} className="snap-start">
              <QuickLogCard 
                log={log} 
                onSelect={onSelect} 
                onTogglePin={handleTogglePin} 
              />
            </div>
          ))}
          {filteredLogs.length === 0 && (
            <div className="w-full text-center text-slate-500 py-8">
              No matching activities found.
            </div>
          )}
        </div>

        {showRightArrow && (
          <button 
            onClick={() => scrollBy(300)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md border border-slate-200 text-slate-600 hover:text-primary-600 hover:bg-slate-50 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight />
          </button>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
};

export default QuickLogCarousel;
