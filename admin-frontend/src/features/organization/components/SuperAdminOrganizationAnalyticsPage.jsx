import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminAxios as api } from '../../../core/api';
import { Card, Row, Col, Statistic, Typography, Button, Alert } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Leaf, Users, TrendingDown, Activity, Lock } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

const { Title, Text } = Typography;
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export const SuperAdminOrganizationAnalyticsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: analytics, isLoading } = useQuery({
        queryKey: ['super-admin-org-analytics', id],
        queryFn: async () => {
            const response = await api.get(`/super-admin/organizations/${id}/analytics`);
            return response.data;
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!analytics) return null;

    if (analytics.privacyStatus === 'INSUFFICIENT_DATA') {
        return (
            <div className="p-8 max-w-7xl mx-auto min-h-screen bg-slate-50/50">
                <Button 
                    type="text" 
                    icon={<ArrowLeftOutlined />} 
                    onClick={() => navigate('/organizations')} 
                    className="mb-6 hover:bg-slate-200 transition-colors rounded-lg"
                >
                    Back to Organizations
                </Button>
                <Title level={2} className="!font-extrabold tracking-tight text-slate-800">Organization Analytics</Title>
                <div className="mt-12 bg-white/60 backdrop-blur-xl border border-amber-200/50 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 blur-3xl rounded-full pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-400/10 blur-3xl rounded-full pointer-events-none"></div>
                    
                    <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-50 text-amber-500 border border-amber-200 rounded-full flex items-center justify-center mb-6 shadow-inner z-10">
                        <Lock size={40} className="animate-pulse" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tight z-10">Data Masked for Privacy</h3>
                    <p className="text-lg text-slate-500 font-medium max-w-xl mb-10 z-10 leading-relaxed">
                        {analytics.message}
                    </p>
                    <div className="flex gap-6 z-10 w-full max-w-lg justify-center">
                        <div className="flex-1 bg-white/80 px-6 py-5 rounded-2xl border border-slate-200/60 text-center shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-4xl font-black text-slate-800 mb-1">{analytics.totalMembers}</div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Members</div>
                        </div>
                        <div className="flex-1 bg-white/80 px-6 py-5 rounded-2xl border border-slate-200/60 text-center shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-4xl font-black text-slate-800 mb-1">{analytics.activeMembers}</div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Members</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const deptData = analytics.departmentEmissions 
        ? Object.entries(analytics.departmentEmissions).map(([name, value]) => ({ name, value }))
        : [];

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-slate-50/30">
            <Button 
                type="text" 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/organizations')} 
                className="mb-6 hover:bg-slate-200 transition-colors rounded-lg font-medium"
            >
                Back to Organizations
            </Button>
            
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <Title level={2} className="!mb-1 !font-extrabold tracking-tight text-slate-800">Organization Analytics</Title>
                    <Text className="text-slate-500 font-medium text-lg">Aggregated insights for the selected organization.</Text>
                </div>
                <div className="bg-emerald-100/50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    Data Verified & Active
                </div>
            </div>

            <Row gutter={[24, 24]} className="mb-10">
                <Col xs={24} sm={12} lg={6}>
                    <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-400/10 blur-2xl rounded-full transition-transform group-hover:scale-150"></div>
                        <div className="flex items-center gap-3 text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg"><Leaf size={18} /></div> Total Emissions
                        </div>
                        <div className="text-4xl font-black text-slate-800 tracking-tight">
                            {analytics.totalCarbonFootprint?.toFixed(2) || 0} <span className="text-lg text-slate-400 font-semibold">kg CO2e</span>
                        </div>
                    </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-400/10 blur-2xl rounded-full transition-transform group-hover:scale-150"></div>
                        <div className="flex items-center gap-3 text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Users size={18} /></div> Active Members
                        </div>
                        <div className="text-4xl font-black text-slate-800 tracking-tight">
                            {analytics.activeMembers || 0}
                        </div>
                    </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-400/10 blur-2xl rounded-full transition-transform group-hover:scale-150"></div>
                        <div className="flex items-center gap-3 text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                            <div className="p-2 bg-amber-50 text-amber-500 rounded-lg"><TrendingDown size={18} /></div> Avg per Member
                        </div>
                        <div className="text-4xl font-black text-slate-800 tracking-tight">
                            {analytics.avgCarbonPerMember?.toFixed(2) || 0} <span className="text-lg text-slate-400 font-semibold">kg CO2e</span>
                        </div>
                    </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-400/10 blur-2xl rounded-full transition-transform group-hover:scale-150"></div>
                        <div className="flex items-center gap-3 text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                            <div className="p-2 bg-purple-50 text-purple-500 rounded-lg"><Activity size={18} /></div> Total Activities
                        </div>
                        <div className="text-4xl font-black text-slate-800 tracking-tight">
                            {analytics.totalActivities || 0}
                        </div>
                    </div>
                </Col>
            </Row>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-800 mb-8 tracking-tight">Emissions by Department</h3>
                    {deptData.length > 0 ? (
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={deptData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 500 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 500 }} dx={-10} />
                                    <Tooltip 
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                    />
                                    <Bar dataKey="value" name="Emissions (kg CO2e)" radius={[8, 8, 0, 0]} maxBarSize={60}>
                                        {deptData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity" />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                            <Activity className="w-12 h-12 mb-3 text-slate-300" />
                            <p className="font-medium text-lg">No department data available.</p>
                        </div>
                    )}
                </div>

                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 p-8 shadow-xl text-white relative overflow-hidden">
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none"></div>
                     <h3 className="text-xl font-bold text-white mb-6 tracking-tight relative z-10">Analytics Snapshot</h3>
                     
                     <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-5 border border-slate-600/50 mb-6 relative z-10">
                        <p className="text-slate-300 font-medium leading-relaxed">
                            This analytics view aggregates data from <strong className="text-white text-lg">{analytics.activeMembers}</strong> active members in the organization.
                        </p>
                     </div>

                     <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-5 relative z-10">
                         <div className="flex items-center gap-3 text-indigo-300 font-bold mb-2">
                             <Lock size={18} /> Privacy Notice
                         </div>
                         <p className="text-indigo-200/70 text-sm leading-relaxed">
                            Individual employee data is not accessible. We strictly enforce a minimum threshold of 3 active members before aggregate data can be viewed to protect individual user privacy.
                         </p>
                     </div>
                </div>
            </div>
        </div>
    );
};

