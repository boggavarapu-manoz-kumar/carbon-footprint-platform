import React, { useState } from 'react';
import { Table, Button, Space, Tag, Modal, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined, StopOutlined, CheckCircleOutlined, BarChartOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAxios as api } from '../../../core/api';
import { CreateOrganizationForm } from './CreateOrganizationForm';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export const SuperAdminOrganizationsPage = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: organizations, isLoading } = useQuery({
        queryKey: ['super-admin-organizations'],
        queryFn: async () => {
            const response = await api.get('/super-admin/organizations');
            return response.data;
        }
    });

    const suspendMutation = useMutation({
        mutationFn: async (id) => api.put(`/super-admin/organizations/${id}/suspend`),
        onSuccess: () => {
            message.success('Organization suspended');
            queryClient.invalidateQueries(['super-admin-organizations']);
        },
        onError: () => message.error('Failed to suspend organization')
    });

    const reactivateMutation = useMutation({
        mutationFn: async (id) => api.put(`/super-admin/organizations/${id}/reactivate`),
        onSuccess: () => {
            message.success('Organization reactivated');
            queryClient.invalidateQueries(['super-admin-organizations']);
        },
        onError: () => message.error('Failed to reactivate organization')
    });

    const handleStatusToggle = (org) => {
        if (org.status === 'ACTIVE') {
            Modal.confirm({
                title: 'Suspend Organization?',
                content: 'Users and Admins will no longer be able to access the organization workspace.',
                okText: 'Suspend',
                okType: 'danger',
                onOk: () => suspendMutation.mutate(org.id)
            });
        } else {
            Modal.confirm({
                title: 'Reactivate Organization?',
                content: 'Restore access for all users in this organization.',
                okText: 'Reactivate',
                onOk: () => reactivateMutation.mutate(org.id)
            });
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <strong className="text-gray-800">{text}</strong>
        },
        {
            title: 'Code',
            dataIndex: 'organizationCode',
            key: 'code',
            render: (text) => <Text copyable>{text}</Text>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'ACTIVE' ? 'success' : 'error'}>
                    {status}
                </Tag>
            )
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString()
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button 
                        size="small" 
                        onClick={() => navigate(`/organization/${record.id}/members`)}
                    >
                        Members
                    </Button>
                    <Button 
                        size="small" 
                        icon={<BarChartOutlined />}
                        onClick={() => navigate(`/organization/${record.id}/analytics`)}
                    >
                        Analytics
                    </Button>
                    <Button 
                        size="small" 
                        danger={record.status === 'ACTIVE'}
                        type={record.status === 'ACTIVE' ? 'default' : 'primary'}
                        icon={record.status === 'ACTIVE' ? <StopOutlined /> : <CheckCircleOutlined />}
                        onClick={() => handleStatusToggle(record)}
                        loading={suspendMutation.isPending || reactivateMutation.isPending}
                    >
                        {record.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-slate-50/30">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                <div>
                    <Title level={2} className="!mb-1 !font-extrabold tracking-tight text-slate-800">Organizations</Title>
                    <Text className="text-slate-500 font-medium text-lg">Manage enterprise tenants on the platform</Text>
                </div>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => setIsCreateModalOpen(true)}
                    size="large"
                    className="bg-primary-600 hover:bg-primary-500 shadow-md font-semibold border-0"
                >
                    Create Organization
                </Button>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-3xl rounded-full pointer-events-none"></div>
                
                <Table 
                    dataSource={organizations} 
                    columns={columns} 
                    rowKey="id" 
                    loading={isLoading}
                    className="relative z-10 ant-table-premium"
                    pagination={{ pageSize: 10, className: 'px-4' }}
                />
            </div>

            <Modal
                title={<span className="text-lg font-bold">Create New Organization</span>}
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
                footer={null}
                width={800}
                destroyOnClose
                className="rounded-2xl overflow-hidden"
            >
                <CreateOrganizationForm onSubmit={() => {
                    setIsCreateModalOpen(false);
                    queryClient.invalidateQueries(['super-admin-organizations']);
                }} />
            </Modal>
        </div>
    );
};
