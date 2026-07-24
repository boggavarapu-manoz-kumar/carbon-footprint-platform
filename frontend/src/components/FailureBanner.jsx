import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX, FiInfo } from 'react-icons/fi';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationService from '../services/NotificationService';

const FailureBanner = () => {
    const { notifications, fetchNotifications } = useNotifications();
    const [failures, setFailures] = useState([]);
    
    useEffect(() => {
        // Find unread GOAL_FAILED notifications
        const failedGoals = notifications.filter(
            n => n.type === 'GOAL_FAILED' && !n.read
        );
        setFailures(failedGoals);
    }, [notifications]);

    const handleDismiss = async (id) => {
        try {
            await NotificationService.markAsRead(id);
            setFailures(prev => prev.filter(a => a.id !== id));
            fetchNotifications(); // Refresh global count
        } catch (error) {
            console.error("Failed to dismiss failure banner", error);
        }
    };

    if (failures.length === 0) return null;

    // Show only the first failure at a time to prevent clutter
    const failure = failures[0];
    
    let metaData = {};
    if (failure.metaData) {
        try {
            metaData = JSON.parse(failure.metaData);
        } catch (e) {
            console.error("Failed to parse metaData", e);
        }
    }
    
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 shadow-2xl border border-red-400"
            >
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"></div>
                
                <div className="relative p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
                    
                    {/* Alert Badge */}
                    <div className="flex-shrink-0">
                        <motion.div 
                            initial={{ rotate: -15, scale: 0.5 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                            className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                        >
                            <FiAlertTriangle className="w-10 h-10 text-white" />
                        </motion.div>
                    </div>

                    <div className="flex-grow text-center md:text-left text-white">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                            <h2 className="text-2xl font-bold tracking-tight">Goal Unmet</h2>
                            <FiInfo className="text-red-200 w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-medium text-red-50 mb-3">{failure.goalName}</h3>
                        
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4 border border-white/20">
                            <p className="text-sm md:text-base leading-relaxed text-red-50 font-medium italic">
                                "{metaData.aiSummary || failure.description}"
                            </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                             <div className="bg-white/20 rounded-full px-4 py-1.5 text-sm font-semibold flex items-center gap-2">
                                <span>🎯 Target Limit:</span>
                                <span>{metaData.targetEmissions || 'N/A'}</span>
                             </div>
                             <div className="bg-white/20 rounded-full px-4 py-1.5 text-sm font-semibold flex items-center gap-2">
                                <span>⚠️ Actual Result:</span>
                                <span>{metaData.currentEmissions || 'N/A'}</span>
                             </div>
                             <div className="bg-white/20 rounded-full px-4 py-1.5 text-sm font-semibold flex items-center gap-2">
                                <span>📈 Over Target:</span>
                                <span>{metaData.remainingDifference || 'N/A'}</span>
                             </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => handleDismiss(failure.id)}
                        className="absolute top-4 right-4 p-2 text-red-100 hover:text-white hover:bg-white/20 rounded-full transition-colors"
                        aria-label="Dismiss"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default FailureBanner;
