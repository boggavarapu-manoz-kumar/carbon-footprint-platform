import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, AlertCircle, Clock, Activity, Target } from 'lucide-react';
import ActivityMonitorApi from '../api/ActivityMonitorApi';

const ActivityDetailsDrawer = ({ open, onClose, activityId, logType }) => {
    const [tab, setTab] = useState('overview');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (open && activityId && logType) {
            setTab('overview');
            fetchDetails();
        }
    }, [open, activityId, logType]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await ActivityMonitorApi.getActivityDetails(activityId, logType);
            setData(response);
        } catch (err) {
            setError(err.message || 'Failed to load activity details');
        } finally {
            setLoading(false);
        }
    };

    const renderDataRow = (label, value) => (
        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
            <span className="text-sm text-gray-500 font-medium">{label}</span>
            <span className="text-sm text-gray-900 font-semibold">{value || 'N/A'}</span>
        </div>
    );

    const renderOverview = () => {
        if (!data?.currentData) return <div className="p-6 text-gray-500">No data found</div>;
        const current = data.currentData;

        return (
            <div className="p-6 space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <Activity className="w-5 h-5 text-primary-600" />
                        Activity Details
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm">
                        {renderDataRow('ID', current.id)}
                        {renderDataRow('Category', logType === 'REGULAR' ? current.activityType : 'Other')}
                        {logType === 'OTHER' && renderDataRow('Activity Name', current.activityName)}
                        {logType === 'OTHER' && renderDataRow('Description', current.activityDescription)}
                        {renderDataRow('Quantity', `${current.quantity || current.distance || current.amount || 0} ${current.unit || ''}`)}
                        {renderDataRow('Carbon Emission', `${current.carbonEmission || current.carbonValue || 0} kg CO2`)}
                        {renderDataRow('Date Logged', current.logDate || current.activityDate)}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <Target className="w-5 h-5 text-primary-600" />
                        System Info
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm">
                        {renderDataRow('Created At', new Date(current.createdAt).toLocaleString())}
                    </div>
                </div>
            </div>
        );
    };

    const getActionBadgeColor = (action) => {
        switch (action) {
            case 'CREATED': return 'bg-green-100 text-green-800 border-green-200';
            case 'UPDATED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'DELETED': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getActionBorderColor = (action) => {
        switch (action) {
            case 'CREATED': return 'border-l-green-500';
            case 'UPDATED': return 'border-l-yellow-500';
            case 'DELETED': return 'border-l-red-500';
            default: return 'border-l-gray-500';
        }
    };

    const formatJson = (jsonStr) => {
        try {
            if (!jsonStr) return 'null';
            return JSON.stringify(JSON.parse(jsonStr), null, 2);
        } catch {
            return jsonStr;
        }
    };

    const renderHistory = () => {
        if (!data?.history || data.history.length === 0) {
            return (
                <div className="p-12 text-center flex flex-col items-center">
                    <Clock className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">No history logs found for this activity.</p>
                </div>
            );
        }

        return (
            <div className="p-6 space-y-4">
                {data.history.map((log) => (
                    <div key={log.id} className={`bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 ${getActionBorderColor(log.action)} p-4`}>
                        <div className="flex justify-between items-start mb-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getActionBadgeColor(log.action)}`}>
                                {log.action}
                            </span>
                            <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-md">
                                {new Date(log.timestamp).toLocaleString()}
                            </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">
                            <span className="font-semibold">Changed By:</span> {log.changedBy}
                        </p>
                        
                        {log.action === 'UPDATED' && (
                            <div className="mt-3 grid grid-cols-1 xl:grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 overflow-hidden">
                                    <span className="text-xs font-bold text-gray-500 uppercase block mb-2 border-b border-gray-200 pb-1">Old Data</span>
                                    <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap font-mono">
                                        {formatJson(log.oldData)}
                                    </pre>
                                </div>
                                <div className="bg-green-50 rounded-lg p-3 border border-green-100 overflow-hidden">
                                    <span className="text-xs font-bold text-green-700 uppercase block mb-2 border-b border-green-200 pb-1">New Data</span>
                                    <pre className="text-xs text-green-800 overflow-x-auto whitespace-pre-wrap font-mono">
                                        {formatJson(log.newData)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 z-50 w-full md:w-[600px] bg-white shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-primary-600 text-white px-6 py-5 flex justify-between items-center shadow-md z-10">
                            <div>
                                <h2 className="text-xl font-bold tracking-tight">Activity Inspection</h2>
                                <p className="text-primary-100 text-sm mt-1 flex items-center gap-2">
                                    <span className="bg-primary-500 px-2 py-0.5 rounded-md font-mono text-xs border border-primary-400">ID: {activityId}</span>
                                    <span className="bg-primary-500 px-2 py-0.5 rounded-md font-mono text-xs border border-primary-400">TYPE: {logType}</span>
                                </p>
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-2 bg-primary-700/50 hover:bg-primary-500 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 bg-gray-50/80 px-4 pt-2">
                            <button
                                onClick={() => setTab('overview')}
                                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                    tab === 'overview' 
                                        ? 'border-primary-600 text-primary-700' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setTab('history')}
                                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                                    tab === 'history' 
                                        ? 'border-primary-600 text-primary-700' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Clock className="w-4 h-4" /> Full History
                            </button>
                        </div>

                        {/* Content Body */}
                        <div className="flex-1 overflow-y-auto bg-gray-50/30">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-full p-12">
                                    <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
                                    <p className="text-gray-500 text-sm">Fetching activity details...</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center h-full p-12 text-red-500">
                                    <AlertCircle className="w-12 h-12 mb-3" />
                                    <p className="font-medium text-center">{error}</p>
                                    <button 
                                        onClick={fetchDetails}
                                        className="mt-4 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            ) : (
                                <motion.div
                                    key={tab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {tab === 'overview' ? renderOverview() : renderHistory()}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ActivityDetailsDrawer;
