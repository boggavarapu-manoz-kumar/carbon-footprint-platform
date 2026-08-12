import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Building, Plus, 
    CheckCircle, XCircle, Ban as StopCircle 
} from 'lucide-react';
import SuperAdminOrganizationService from '../../services/SuperAdminOrganizationService';
import { useNavigate } from 'react-router-dom';

export default function SuperAdminOrganizations() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: organizations, isLoading, error } = useQuery({
        queryKey: ['super-admin-organizations'],
        queryFn: () => SuperAdminOrganizationService.getAllOrganizations().then(res => res.data)
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }) => SuperAdminOrganizationService.updateOrganizationStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries(['super-admin-organizations']);
        }
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'ACTIVE':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-4 h-4 mr-1" /> Active</span>;
            case 'PENDING':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
            case 'SUSPENDED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><StopCircle className="w-4 h-4 mr-1" /> Suspended</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    if (isLoading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Building className="w-8 h-8 mr-3 text-emerald-600" />
                        Organizations
                    </h1>
                    <p className="mt-2 text-sm text-gray-700">
                        A list of all corporate organizations using the platform.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button
                        onClick={() => navigate('/dashboard/admin/organizations/create')}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:w-auto transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-2 -ml-1" />
                        Create Organization
                    </button>
                </div>
            </div>
            
            {error && (
                <div className="mt-4 bg-red-50 p-4 rounded-md border border-red-200">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error loading organizations</h3>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Organization</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Code</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Industry</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Created</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {organizations?.map((org) => (
                                        <tr key={org.id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        {org.logoUrl ? (
                                                            <img className="h-10 w-10 rounded-full object-cover" src={org.logoUrl} alt="" />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                                                <span className="text-emerald-700 font-medium text-lg">{org.name.charAt(0)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="font-medium text-gray-900">{org.name}</div>
                                                        <div className="text-gray-500">{org.country || 'Global'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{org.code}</span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {org.industry || '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {getStatusBadge(org.status)}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {new Date(org.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                {org.status === 'ACTIVE' ? (
                                                    <button 
                                                        onClick={() => statusMutation.mutate({ id: org.id, status: 'SUSPENDED' })}
                                                        className="text-red-600 hover:text-red-900 ml-4 transition-colors"
                                                        disabled={statusMutation.isLoading}
                                                    >
                                                        Suspend
                                                    </button>
                                                ) : org.status === 'SUSPENDED' ? (
                                                    <button 
                                                        onClick={() => statusMutation.mutate({ id: org.id, status: 'ACTIVE' })}
                                                        className="text-emerald-600 hover:text-emerald-900 ml-4 transition-colors"
                                                        disabled={statusMutation.isLoading}
                                                    >
                                                        Activate
                                                    </button>
                                                ) : null}
                                            </td>
                                        </tr>
                                    ))}
                                    {organizations?.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="py-8 text-center text-sm text-gray-500">
                                                No organizations found. Click "Create Organization" to get started.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
