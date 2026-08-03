import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, ChevronRight, Share2 } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const BadgeUnlockModal = ({ notification, onClose }) => {
  const { width, height } = useWindowSize();
  const [badgeData, setBadgeData] = useState(null);

  useEffect(() => {
    if (notification && notification.metaData) {
      try {
        const parsed = JSON.parse(notification.metaData);
        setBadgeData(parsed);
      } catch (error) {
        console.error('Failed to parse badge metadata', error);
      }
    }
  }, [notification]);

  const getImageUrl = (url) => {
    if (!url || url.trim() === '') return null;
    const rawUrl = url.trim();
    if (rawUrl.startsWith('http') || rawUrl.startsWith('data:')) return rawUrl;
    const hostname = window.location.hostname;
    const apiUrl = import.meta.env.VITE_API_URL || `http://${hostname}:8081/api`;
    const baseUrl = apiUrl.replace(/\/api$/, '') || `http://${hostname}:8081`;
    return `${baseUrl}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
  };

  if (!notification || !badgeData) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Confetti overlay */}
        <div className="absolute inset-0 pointer-events-none z-50">
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={400}
            gravity={0.15}
          />
        </div>

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden z-10"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-8 text-center relative overflow-hidden">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12, delay: 0.2 }}
              className="relative w-32 h-32 mx-auto mb-4"
            >
              <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse" />
              {badgeData.imageUrl ? (
                <img 
                  src={getImageUrl(badgeData.imageUrl) || badgeData.imageUrl} 
                  alt={badgeData.badgeName} 
                  className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg relative z-10"
                />
              ) : (
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white relative z-10">
                  <Award className="w-16 h-16 text-emerald-500" />
                </div>
              )}
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-white mb-2"
            >
              Achievement Unlocked!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-emerald-50 font-medium"
            >
              You earned the {badgeData.badgeName} badge
            </motion.p>
          </div>

          {/* Body */}
          <div className="p-8">
            <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
              <div className="text-center mb-4">
                <span className="inline-block bg-emerald-100 text-emerald-700 font-bold px-4 py-1.5 rounded-full text-sm">
                  +{badgeData.points} Points
                </span>
              </div>
              <p className="text-slate-600 text-center text-sm font-medium">
                {badgeData.criteria}
              </p>
            </div>

            {/* Next badge suggestion */}
            {badgeData.nextBadgeSuggestion && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg shrink-0">
                  <Award className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-indigo-900 mb-1">Next Challenge</h4>
                  <p className="text-xs text-indigo-700 leading-relaxed">
                    {badgeData.nextBadgeSuggestion}
                  </p>
                </div>
              </div>
            )}
            
            <div className="mt-8 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
              >
                Awesome!
              </button>
              <button
                className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BadgeUnlockModal;
