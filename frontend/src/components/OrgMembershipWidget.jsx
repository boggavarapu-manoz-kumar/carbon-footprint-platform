import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Briefcase, Users, ChevronRight, CheckCircle } from 'lucide-react';

const roleColors = {
  ORGANIZATION_ADMIN: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Admin' },
  ORGANIZATION_EMPLOYEE: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Employee' },
};

const OrgMembershipWidget = ({ orgContext }) => {
  if (!orgContext) return null;

  const role = roleColors[orgContext.role] || roleColors.ORGANIZATION_EMPLOYEE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-lg shadow-slate-900/10 relative overflow-hidden"
    >
      {/* Decorative blob */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-teal-400/10 rounded-full blur-xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          {orgContext.organizationLogo ? (
            <img
              src={orgContext.organizationLogo}
              alt={orgContext.organizationName}
              className="w-10 h-10 rounded-lg object-cover ring-2 ring-white/20"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
          )}
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-0.5">Organization</p>
            <p className="font-black text-white text-base leading-tight">{orgContext.organizationName}</p>
          </div>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${role.bg} ${role.text}`}>
          {role.label}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 relative z-10">
        {orgContext.jobTitle && (
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <Briefcase className="w-4 h-4 text-white/40 flex-shrink-0" />
            <span>{orgContext.jobTitle}</span>
          </div>
        )}
        {orgContext.department && (
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <Users className="w-4 h-4 text-white/40 flex-shrink-0" />
            <span>{orgContext.department}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>Active Member</span>
        </div>
      </div>

      {/* CTA */}
      <Link
        to="/dashboard/org-leaderboard"
        className="mt-4 flex items-center justify-between text-xs font-bold text-white/50 hover:text-white/90 transition-colors pt-3 border-t border-white/10 relative z-10"
      >
        <span>View Team Leaderboard</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </motion.div>
  );
};

export default OrgMembershipWidget;
