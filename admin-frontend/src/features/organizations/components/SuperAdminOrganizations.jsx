import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Building, Plus, 
    CheckCircle, XCircle, Ban as StopCircle, Search, ChevronRight, Globe, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SuperAdminOrganizationService from '../services/SuperAdminOrganizationService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function SuperAdminOrganizations() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const { data: organizations, isLoading, error } = useQuery({
        queryKey: ['super-admin-organizations'],
        queryFn: () => SuperAdminOrganizationService.getAllOrganizations().then(res => res.data)
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }) => SuperAdminOrganizationService.updateOrganizationStatus(id, status),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['super-admin-organizations']);
            toast.success(`Organization status updated to ${variables.status}`);
        },
        onError: () => {
            toast.error("Failed to update organization status");
        }
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'ACTIVE':
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle className="w-3.5 h-3.5 mr-1" /> Active</span>;
            case 'PENDING':
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">Pending</span>;
            case 'SUSPENDED':
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200"><StopCircle className="w-3.5 h-3.5 mr-1" /> Suspended</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">{status}</span>;
        }
    };

    const filteredOrgs = organizations?.filter(org => 
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        org.code.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="min-h-screen bg-slate-50/50 px-4 sm:px-6 lg:px-8 py-10 relative overflow-hidden">
            
            {/* Background elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob pointer-events-none"></div>
            <div className="absolute top-40 left-0 -ml-20 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sm:flex sm:items-center sm:justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8"
                >
                    <div className="sm:flex-auto">
                        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                                <Building className="w-7 h-7" />
                            </div>
                            Organizations
                        </h1>
                        <p className="mt-2 text-sm text-slate-500 max-w-2xl">
                            Manage all corporate entities using the Carbon Footprint Platform. 
                            Suspend access, view statuses, and onboard new organizations.
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex flex-col sm:items-end gap-4">
                        <button
                            onClick={() => navigate('/organizations/create')}
                            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 hover:shadow-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 hover:-translate-y-0.5"
                        >
                            <Plus className="w-5 h-5 mr-1" />
                            Provision New Organization
                        </button>
                    </div>
                </motion.div>
                
                {/* Search Bar */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6 relative max-w-md"
                >
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm"
                        placeholder="Search by name or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </motion.div>

                {error && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 bg-rose-50 p-4 rounded-xl border border-rose-200 mb-6 flex items-center">
                        <XCircle className="h-6 w-6 text-rose-500 mr-3" />
                        <h3 className="text-sm font-bold text-rose-800">Failed to load organizations. Please try refreshing the page.</h3>
                    </motion.div>
                )}

                {/* Main Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative min-h-[400px]">
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                                <p className="text-slate-500 font-medium animate-pulse">Loading organizations...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50/80 backdrop-blur-md sticky top-0 z-10">
                                    <tr>
                                        <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Organization Details</th>
                                        <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Code</th>
                                        <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Industry & Size</th>
                                        <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Onboarded</th>
                                        <th scope="col" className="relative py-4 pl-3 pr-6"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    <AnimatePresence>
                                        {filteredOrgs.map((org, index) => (
                                            <motion.tr 
                                                key={org.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="hover:bg-slate-50/80 transition-colors group"
                                            >
                                                <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
                                                    <div className="flex items-center">
                                                        <div className="h-12 w-12 flex-shrink-0">
                                                            {org.logoUrl ? (
                                                                <img className="h-12 w-12 rounded-xl object-cover border border-slate-200 shadow-sm" src={org.logoUrl} alt="" />
                                                            ) : (
                                                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center border border-emerald-200 shadow-sm">
                                                                    <span className="text-emerald-700 font-bold text-xl">{org.name.charAt(0)}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="font-bold text-slate-900 text-base">{org.name}</div>
                                                            <div className="text-slate-500 flex items-center text-xs mt-0.5">
                                                                <Globe className="w-3 h-3 mr-1" />
                                                                {org.country || 'Global'} • {org.timezone || 'UTC'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
                                                    <span className="font-mono bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md font-medium">{org.code}</span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
                                                    <div className="font-medium">{org.industry || '-'}</div>
                                                    <div className="text-xs text-slate-400">{org.companySize || '-'}</div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
                                                    {getStatusBadge(org.status)}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600 font-medium">
                                                    {new Date(org.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                                                    {org.status === 'ACTIVE' ? (
                                                        <button 
                                                            onClick={() => statusMutation.mutate({ id: org.id, status: 'SUSPENDED' })}
                                                            className="text-rose-600 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors font-semibold"
                                                            disabled={statusMutation.isPending}
                                                        >
                                                            Suspend
                                                        </button>
                                                    ) : org.status === 'SUSPENDED' ? (
                                                        <button 
                                                            onClick={() => statusMutation.mutate({ id: org.id, status: 'ACTIVE' })}
                                                            className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors font-semibold"
                                                            disabled={statusMutation.isPending}
                                                        >
                                                            Activate
                                                        </button>
                                                    ) : (
                                                        <span className="text-slate-400 italic text-xs">Waiting for setup</span>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>

                                    {filteredOrgs.length === 0 && !isLoading && (
                                        <tr>
                                            <td colSpan="6" className="py-20 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                        <AlertTriangle className="w-10 h-10 text-slate-400" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-900 mb-1">No organizations found</h3>
                                                    <p className="text-slate-500 mb-6 max-w-sm">
                                                        {searchTerm ? `No results match "${searchTerm}". Try adjusting your search.` : "There are no organizations on the platform yet."}
                                                    </p>
                                                    {!searchTerm && (
                                                        <button
                                                            onClick={() => navigate('/organizations/create')}
                                                            className="text-emerald-600 font-semibold hover:text-emerald-700 flex items-center"
                                                        >
                                                            Provision your first organization <ChevronRight className="w-4 h-4 ml-1" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
