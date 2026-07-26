import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Award, Lock, Star, Shield, Crown, Zap, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import axiosInstance from '../api/axiosConfig';
import AchievementTimeline from '../components/AchievementTimeline';

// A dynamic icon mapping to map backend icon names to Lucide components
const IconMap = {
  Award, Star, Shield, Crown, Zap, TrendingUp, Lock, Calendar
};

const getDynamicIcon = (iconName, className) => {
  const IconComponent = IconMap[iconName] || Award;
  return <IconComponent className={className} />;
};

const fetchBadgeShowcase = async () => {
  const { data } = await axiosInstance.get('/v1/badges/showcase');
  return data;
};

const getBadgeImageUrl = (badge) => {
  if (badge.imageUrl && !badge.imageUrl.includes('flaticon.com')) {
    return badge.imageUrl;
  }
  const iconNameMap = {
    'Star': 'lucide:star',
    'Zap': 'lucide:zap',
    'Award': 'lucide:award',
    'Shield': 'lucide:shield',
    'Leaf': 'lucide:leaf',
    'Crown': 'lucide:crown',
    'FaSeedling': 'lucide:sprout',
    'FaBullseye': 'lucide:target',
    'FaTrophy': 'lucide:trophy',
    'FaFire': 'lucide:flame',
    'FaGem': 'lucide:gem',
    'FaCar': 'lucide:car',
    'FaBolt': 'lucide:zap',
    'FaLeaf': 'lucide:leaf',
    'FaShoppingBag': 'lucide:shopping-bag',
    'FaGlobe': 'lucide:globe',
    'FaRocket': 'lucide:rocket',
    'FaMedal': 'lucide:medal',
    'FaCrown': 'lucide:crown',
    'FaStar': 'lucide:star'
  };
  const icon = iconNameMap[badge.icon] || iconNameMap[badge.iconName] || 'lucide:award';
  const hexColor = (badge.color || '#10b981').replace('#', '%23');
  return `https://api.iconify.design/${icon}.svg?color=${hexColor}&width=96&height=96`;
};

const BadgeCard = ({ badge, isLocked, isUpcoming }) => {
  const [imageError, setImageError] = React.useState(false);
  const imageUrl = getBadgeImageUrl(badge);

  const percentage = badge.targetProgress > 0 
    ? Math.min(100, Math.round((badge.currentProgress / badge.targetProgress) * 100)) 
    : 0;

  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.02 }}
      className={`relative overflow-hidden rounded-3xl p-6 transition-all duration-500 shadow-lg ${
        isLocked 
          ? 'bg-slate-50/80 backdrop-blur-md border border-slate-200/50 grayscale-[0.5]' 
          : 'bg-white/90 backdrop-blur-xl border border-emerald-100 shadow-[0_8px_30px_rgb(16,185,129,0.12)]'
      }`}
    >
      {/* Background glow for earned badges */}
      {!isLocked && (
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br from-emerald-300 to-teal-400 opacity-20 blur-3xl rounded-full pointer-events-none" />
      )}

      <div className="flex items-start justify-between relative z-10">
        <div className="flex gap-5">
          <div className={`flex items-center justify-center w-20 h-20 rounded-3xl flex-shrink-0 shadow-inner p-3 ${
            isLocked ? 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-500' : 'bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
          }`}>
            <img 
              src={imageUrl} 
              alt={badge.name} 
              className={`w-12 h-12 object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-110 ${isLocked ? 'opacity-50 grayscale' : ''}`}
              onError={() => setImageError(true)}
            />
          </div>
          <div className="flex-1 pt-1">
            <h3 className={`text-xl font-extrabold leading-tight tracking-tight mb-1 ${isLocked ? 'text-slate-600' : 'text-slate-900'}`}>
              {badge.name}
            </h3>
            <p className="text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed">{badge.description}</p>
          </div>
        </div>
        {isLocked ? (
          <div className="p-2 bg-slate-100 rounded-full">
            <Lock className="w-5 h-5 text-slate-400" />
          </div>
        ) : (
          <div className="flex flex-col items-end">
            <span className="text-sm font-black text-emerald-700 bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-full shadow-sm">
              +{badge.points} XP
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar for Locked Badges */}
      {isLocked && badge.targetProgress > 0 && (
        <div className="mt-6">
          <div className="flex justify-between text-xs font-medium text-slate-500 mb-2">
            <span>Progress: {badge.currentProgress} / {badge.targetProgress}</span>
            <span>{percentage}%</span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
        </div>
      )}

      {/* Earned Date */}
      {!isLocked && badge.earnedAt && (
        <div className="mt-5 flex items-center gap-1.5 text-xs text-slate-400 font-medium border-t border-slate-100 pt-3">
          <Calendar className="w-3.5 h-3.5" />
          Earned on {new Date(badge.earnedAt).toLocaleDateString()}
        </div>
      )}
    </motion.div>
  );
};

const Badges = () => {
  const { data: showcase, isLoading, isError } = useQuery({
    queryKey: ['badgeShowcase'],
    queryFn: fetchBadgeShowcase
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (isError || !showcase) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Failed to load badges</h2>
        <p className="text-slate-500 mt-2">There was an error connecting to the gamification engine.</p>
      </div>
    );
  }

  const { earnedBadges, upcomingBadges, lockedBadges } = showcase;
  const allEarnedXP = earnedBadges?.reduce((sum, b) => sum + (b.points || 0), 0) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Hero Section */}
      <div className="relative bg-emerald-900 rounded-[2.5rem] p-8 sm:p-14 overflow-hidden shadow-[0_20px_50px_rgba(6,78,59,0.3)]">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
        
        {/* Animated Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 pointer-events-none"
        />
        
        <div className="absolute -bottom-10 right-0 p-4 opacity-20 pointer-events-none transform rotate-12 scale-150 origin-bottom-right">
          <Award className="w-64 h-64 text-white" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-emerald-50 border border-white/20 text-sm font-bold tracking-wide mb-8 uppercase"
          >
            <Star className="w-4 h-4 text-yellow-300" /> Hall of Fame
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-6 drop-shadow-md"
          >
            Your Gamification <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-emerald-200">Showcase</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-emerald-50/90 mb-10 leading-relaxed font-medium max-w-xl"
          >
            Every sustainable action counts. Track your progress, earn powerful badges, and showcase your commitment to the planet.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 min-w-[160px] shadow-xl">
              <div className="text-emerald-200 text-sm font-bold uppercase tracking-wider mb-2">Badges Earned</div>
              <div className="text-4xl font-black text-white">{earnedBadges?.length || 0}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 min-w-[160px] shadow-xl">
              <div className="text-emerald-200 text-sm font-bold uppercase tracking-wider mb-2">Total XP</div>
              <div className="text-4xl font-black text-white">{allEarnedXP.toLocaleString()}</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Earned Badges */}
      {earnedBadges && earnedBadges.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Unlocked Badges</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {earnedBadges.map((badge, idx) => (
              <BadgeCard key={`earned-${badge.id}-${idx}`} badge={badge} isLocked={false} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Badges */}
      {upcomingBadges && upcomingBadges.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Close to Unlocking</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingBadges.map((badge, idx) => (
              <BadgeCard key={`upcoming-${badge.id}-${idx}`} badge={badge} isLocked={true} isUpcoming={true} />
            ))}
          </div>
        </section>
      )}

      {/* Locked Badges */}
      {lockedBadges && lockedBadges.length > 0 && (
        <section className="opacity-80">
          <div className="flex items-center gap-3 mb-6 border-t border-slate-200 pt-10">
            <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Locked Achievements</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {lockedBadges.map((badge, idx) => (
              <BadgeCard key={`locked-${badge.id}-${idx}`} badge={badge} isLocked={true} />
            ))}
          </div>
        </section>
      )}
      
      {/* Empty State */}
      {(!earnedBadges?.length && !upcomingBadges?.length && !lockedBadges?.length) && (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
          <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900">No Badges Available</h3>
          <p className="text-slate-500 mt-2">The gamification engine currently has no badges loaded.</p>
        </div>
      )}

      {/* Timeline Section */}
      <section className="pt-8 border-t border-slate-200">
        <AchievementTimeline />
      </section>

    </div>
  );
};

export default Badges;
