import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Mail, Calendar, Clock, UserX } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';

const Suspended = () => {
  const location = useLocation();
  const suspension = location.state?.suspension;

  // If someone navigates here directly without suspension state, redirect to login
  if (!suspension) {
    return <Navigate to="/login" replace />;
  }

  const startDate = new Date(suspension.startDate);
  const endDate = suspension.endDate ? new Date(suspension.endDate) : null;
  const remainingDays = endDate ? differenceInDays(endDate, new Date()) : 'Permanent';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-xl w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100"
        >
          {/* Header */}
          <div className="bg-red-50 px-8 py-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #ef4444 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10"
            >
              <ShieldAlert className="w-10 h-10 text-red-600" />
            </motion.div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2 relative z-10 tracking-tight">Account Suspended</h1>
            <p className="text-slate-600 relative z-10">Your access to CarbonSync has been temporarily restricted.</p>
          </div>

          {/* Details */}
          <div className="p-8">
            <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Suspension Details</h3>
              
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="mt-1"><UserX className="w-5 h-5 text-slate-400" /></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 mb-1">Reason</p>
                    <p className="text-slate-600 text-sm">{suspension.reason}</p>
                    {suspension.description && <p className="text-slate-500 text-xs mt-1">{suspension.description}</p>}
                  </div>
                </div>

                <div className="h-px bg-slate-200"></div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5"><Calendar className="w-4 h-4 text-slate-400" /></div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-0.5">Suspended On</p>
                      <p className="text-sm font-semibold text-slate-900">{format(startDate, 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5"><Clock className="w-4 h-4 text-slate-400" /></div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-0.5">Time Remaining</p>
                      <p className="text-sm font-semibold text-red-600">
                        {endDate ? `${remainingDays} Days` : 'Indefinite'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="h-px bg-slate-200"></div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-slate-500">A</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Suspended by <span className="font-semibold text-slate-900">{suspension.suspendedBy || 'Administrator'}</span>
                  </p>
                </div>

              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <Link to="/login" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors px-4 py-2 rounded-lg hover:bg-slate-50">
                <ArrowLeft className="w-4 h-4" />
                Return to Login
              </Link>
              
              <a 
                href="mailto:support@carbonsync.com?subject=Account Suspension Inquiry"
                className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-slate-800 transition-all active:scale-95 w-full sm:w-auto shadow-sm"
              >
                <Mail className="w-4 h-4" />
                Contact Support
              </a>
            </div>
          </div>
        </motion.div>
        
        <p className="text-center text-slate-400 text-sm mt-8">
          &copy; {new Date().getFullYear()} CarbonSync Enterprise. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Suspended;
