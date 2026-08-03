import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, ChevronRight, Loader2, Shield, Star, Lock } from 'lucide-react';
import axiosInstance from '../api/axiosConfig';

const fetchBadgeShowcase = async () => {
  const { data } = await axiosInstance.get('/v1/badges/showcase');
  return data;
};

// Mini badge preview card
const MiniBadge = ({ badge }) => {
  let imageUrl = '/vite.svg';
  const rawBadgeImg = badge.imageUrl || badge.imagePath;
  if (rawBadgeImg && rawBadgeImg.trim() !== '') {
    const rawUrl = rawBadgeImg.trim();
    if (rawUrl.startsWith('http') || rawUrl.startsWith('data:')) {
      imageUrl = rawUrl;
    } else {
      const hostname = window.location.hostname;
      const apiUrl = import.meta.env.VITE_API_URL || `http://${hostname}:8081/api`;
      const baseUrl = apiUrl.replace(/\/api$/, '') || `http://${hostname}:8081`;
      imageUrl = `${baseUrl}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
    }
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="relative group bg-white border border-slate-200 rounded-2xl p-3 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-all cursor-pointer"
      title={`${badge.name}: ${badge.description || ''}`}
    >
      <div className="relative z-10 w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-3 shadow-inner p-2 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={badge.name} 
          className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      <h4 className="text-xs font-bold text-slate-800 text-center line-clamp-1 mb-1">{badge.name}</h4>
      <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
        +{badge.points} XP
      </div>
    </motion.div>
  );
};

const BadgeShowcase = () => {
  const navigate = useNavigate();
  const { data: showcase, isLoading, isError } = useQuery({
    queryKey: ['badgeShowcase'],
    queryFn: fetchBadgeShowcase
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (isError || !showcase) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center h-48 text-center">
        <Shield className="w-8 h-8 text-slate-300 mb-2" />
        <p className="text-sm font-medium text-slate-500">Could not load achievements</p>
      </div>
    );
  }

  const { earnedBadges, lockedBadges } = showcase;
  const recentEarned = earnedBadges?.slice(0, 3) || [];
  const nextLocked = lockedBadges?.slice(0, 1) || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-900 to-teal-900">
        <div className="flex items-center gap-2 text-white">
          <Star className="w-5 h-5 text-emerald-300" />
          <h3 className="font-bold text-lg">Your Achievements</h3>
        </div>
        <div className="text-xs font-medium bg-white/20 text-emerald-50 px-2.5 py-1 rounded-full">
          {earnedBadges?.length || 0} Earned
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        {recentEarned.length > 0 ? (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {recentEarned.map((badge, idx) => (
              <MiniBadge key={idx} badge={badge} />
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 mb-4">
            <Award className="w-10 h-10 text-slate-300 mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No badges yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Log your first sustainable activity to earn a badge!</p>
          </div>
        )}

        {/* Next locked badge preview */}
        {nextLocked.length > 0 && (
          <div className="mt-auto mb-4 bg-slate-50 rounded-lg p-3 border border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">{nextLocked[0].name}</p>
              <p className="text-[10px] text-slate-500 truncate">Locked • Keep logging to earn</p>
            </div>
          </div>
        )}

        <button
          onClick={() => navigate('/dashboard/badges')}
          className="w-full mt-auto flex items-center justify-center gap-1.5 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-sm rounded-xl transition-colors"
        >
          View Full Showcase
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default BadgeShowcase;
