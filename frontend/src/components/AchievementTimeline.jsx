import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, UserPlus, Target, Award, Leaf, Zap, Globe, Trophy, Star } from 'lucide-react';
import GamificationService from '../services/GamificationService';

const ICON_MAP = {
  person_add: UserPlus,
  leaf: Leaf,
  flag: Target,
  emoji_events: Award,
  zap: Zap,
  globe: Globe,
  trophy: Trophy,
  star: Star,
  default: Award,
};

const AchievementTimeline = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const data = await GamificationService.getTimeline();
        // Since backend returns a nested data object typically via ApiResponse, 
        // handle data array if it is inside data.data or just data.
        const timelineData = data?.data || data || [];
        setEvents(Array.isArray(timelineData) ? timelineData : []);
      } catch (error) {
        console.error("Failed to fetch timeline", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-700">Your Journey Awaits</h3>
        <p className="text-slate-500 mt-2">Log your first activity to start your timeline!</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Your Achievement Timeline</h2>
        <p className="text-slate-500">Every milestone in your sustainability journey, chronologically documented.</p>
      </div>

      <div className="relative border-l-2 border-slate-200 ml-4 md:ml-6 space-y-8 pb-4">
        {events.map((event, index) => {
          const IconComponent = ICON_MAP[event.iconName] || ICON_MAP.default;
          // Clean up standard Tailwind classes
          const colorClass = event.color || 'text-emerald-500';
          const bgClass = colorClass.replace('text-', 'bg-').replace('-500', '-100');

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative pl-8 md:pl-12"
            >
              {/* Timeline Dot */}
              <div
                className={`absolute -left-[11px] top-1.5 h-5 w-5 rounded-full border-4 border-white ${colorClass.replace('text-', 'bg-')} shadow-sm`}
              />

              {/* Event Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${bgClass} ${colorClass} group-hover:scale-110 transition-transform`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-base font-bold text-slate-900 truncate">
                        {event.title}
                      </h3>
                      <div className="flex items-center text-xs font-medium text-slate-400 whitespace-nowrap bg-slate-50 px-2 py-1 rounded-full">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(event.timestamp).toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementTimeline;
