import React from 'react';
import { ArrowLeft, Activity, Target, Flame, Trophy, Star, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PointsGuide = () => {
  const navigate = useNavigate();

  const pointRules = [
    {
      category: "Daily Actions",
      icon: <Activity className="w-6 h-6 text-blue-500" />,
      color: "from-blue-500 to-cyan-400",
      bgLight: "bg-blue-50",
      rules: [
        { name: "Log an Activity", points: "+10 pts", desc: "Every time you log a daily sustainable activity." },
        { name: "Log Electricity", points: "+15 pts", desc: "For tracking your monthly electricity usage." }
      ]
    },
    {
      category: "Goals & Milestones",
      icon: <Target className="w-6 h-6 text-emerald-500" />,
      color: "from-emerald-500 to-teal-400",
      bgLight: "bg-emerald-50",
      rules: [
        { name: "Complete a Goal", points: "+50 pts", desc: "Successfully completing any sustainability goal." },
        { name: "Set a New Goal", points: "+5 pts", desc: "Taking the initiative to set a new target." }
      ]
    },
    {
      category: "Streaks",
      icon: <Flame className="w-6 h-6 text-orange-500" />,
      color: "from-orange-500 to-amber-400",
      bgLight: "bg-orange-50",
      rules: [
        { name: "7-Day Streak", points: "+50 pts", desc: "Logging activities for 7 consecutive days." },
        { name: "30-Day Streak", points: "+200 pts", desc: "A full month of consistent sustainability." },
        { name: "60-Day Streak", points: "+500 pts", desc: "Two months of unwavering commitment." },
        { name: "90-Day Streak", points: "+1000 pts", desc: "An incredible three-month eco-streak." }
      ]
    }
  ];

  const levels = [
    { name: "Eco Beginner", min: 0, icon: <Shield className="w-8 h-8 text-slate-400" />, border: "border-slate-200" },
    { name: "Bronze", min: 100, icon: <Star className="w-8 h-8 text-amber-600" />, border: "border-amber-200" },
    { name: "Silver", min: 500, icon: <Zap className="w-8 h-8 text-slate-300" />, border: "border-slate-300" },
    { name: "Gold", min: 1000, icon: <Trophy className="w-8 h-8 text-yellow-400" />, border: "border-yellow-200" }
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">How to Earn Points</h1>
          <p className="text-slate-500 text-lg mt-1">Your guide to leveling up and making an impact.</p>
        </div>
      </div>

      {/* Intro Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-8 mb-12 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl group-hover:bg-purple-500/30 transition-all duration-700"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl group-hover:bg-indigo-500/30 transition-all duration-700"></div>
        
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-indigo-100">The Rules of the Game</h2>
          <p className="text-purple-100/80 text-lg leading-relaxed">
            Every sustainable action you take earns you points. Compete on the leaderboard, maintain streaks, and hit milestones to climb the ranks from Eco Beginner to Gold tier. Your journey to a greener planet starts here.
          </p>
        </div>
      </div>

      {/* Rules Grid */}
      <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <Activity className="w-6 h-6 text-emerald-500" />
        Point Allocations
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {pointRules.map((section, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-xl ${section.bgLight}`}>
                {section.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800">{section.category}</h3>
            </div>
            <div className="space-y-4">
              {section.rules.map((rule, ridx) => (
                <div key={ridx} className="group/rule relative">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-slate-700">{rule.name}</span>
                    <span className={`font-black bg-clip-text text-transparent bg-gradient-to-r ${section.color}`}>
                      {rule.points}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 leading-snug">{rule.desc}</p>
                  {ridx !== section.rules.length - 1 && <div className="h-px w-full bg-slate-100 mt-4"></div>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Levels Section */}
      <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-yellow-500" />
        Level Tiers
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {levels.map((level, idx) => (
          <div key={idx} className={`bg-white rounded-2xl border-2 ${level.border} p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}>
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-current`}></div>
            <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
              {level.icon}
            </div>
            <h4 className="text-lg font-bold text-slate-800 mb-1">{level.name}</h4>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
              {level.min}+ pts
            </span>
          </div>
        ))}
      </div>

    </div>
  );
};

export default PointsGuide;
