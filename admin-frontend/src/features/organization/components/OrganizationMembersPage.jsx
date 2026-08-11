import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Typography, message, Modal, Form, Select, Button, Space, Input } from 'antd';
import { adminAxios as api } from '../../../core/api';
import { OrganizationMembersTable } from './OrganizationMembersTable';

const { Title } = Typography;
const { Option } = Select;

export const OrganizationMembersPage = () => {
    const { id: orgId } = useParams();
    const queryClient = useQueryClient();
    
    // Pagination & Search state
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    
    // Modal state
    const [roleModalVisible, setRoleModalVisible] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [form] = Form.useForm();

    const fetchMembers = async ({ queryKey }) => {
        const [_key, orgId, page, size, search] = queryKey;
        const response = await api.get(`/organizations/${orgId}/members`, {
            params: { page, size, search: search || undefined }
        });
        return response.data;
    };

    const { data, isLoading } = useQuery({
        queryKey: ['orgMembers', orgId, page, pageSize, search],
        queryFn: fetchMembers,
        keepPreviousData: true,
    });

    const statusMutation = useMutation({
        mutationFn: ({ memberId, status }) => api.put(`/organizations/${orgId}/members/${memberId}/status`, { status }),
        onSuccess: () => {
            message.success('Member status updated');
            queryClient.invalidateQueries(['orgMembers', orgId]);
        },
        onError: (error) => {
            message.error(error.response?.data?.message || 'Failed to update member status');
        }
    });

    const removeMutation = useMutation({
        mutationFn: (memberId) => api.delete(`/organizations/${orgId}/members/${memberId}`),
        onSuccess: () => {
            message.success('Member removed from organization');
            queryClient.invalidateQueries(['orgMembers', orgId]);
        },
        onError: (error) => {
            message.error(error.response?.data?.message || 'Failed to remove member');
        }
    });
    
    const roleMutation = useMutation({
        mutationFn: ({ memberId, role }) => api.put(`/organizations/${orgId}/members/${memberId}/role`, { role }),
        onSuccess: () => {
            message.success('Member role updated');
            setRoleModalVisible(false);
            form.resetFields();
            queryClient.invalidateQueries(['orgMembers', orgId]);
        },
        onError: (error) => {
            message.error(error.response?.data?.message || 'Failed to update member role');
        }
    });

    const handleSuspend = (memberId) => {
        statusMutation.mutate({ memberId, status: 'SUSPENDED' });
    };

    const handleReactivate = (memberId) => {
        statusMutation.mutate({ memberId, status: 'ACTIVE' });
    };

    const handleRemove = (memberId) => {
        removeMutation.mutate(memberId);
    };

    const handleChangeRole = (member) => {
        setSelectedMember(member);
        form.setFieldsValue({ role: member.role });
        setRoleModalVisible(true);
    };

    const submitRoleChange = (values) => {
        roleMutation.mutate({ memberId: selectedMember.id, role: values.role });
    };

    // Table triggers
    const handleTableChange = (pagination, filters, sorter) => {
        setPage(pagination.current - 1); // Antd is 1-indexed, Spring is 0-indexed
        setPageSize(pagination.pageSize);
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <Title level={2}>Organization Members</Title>
                <p className="text-gray-500">Manage your organization's employees, their roles, and access.</p>
            </div>

            <OrganizationMembersTable 
                members={data?.content || []}
                loading={isLoading || statusMutation.isLoading || removeMutation.isLoading}
                total={data?.totalElements || 0}
                currentPage={page + 1}
                pageSize={pageSize}
                search={search}
                onSearchChange={setSearch}
                onTableChange={handleTableChange}
                onInvite={() => message.info('Invite flow to be triggered')}
                onSuspend={handleSuspend}
                onReactivate={handleReactivate}
                onRemove={handleRemove}
                onChangeRole={handleChangeRole}
            />

            <Modal
                title="Change Member Role"
                visible={roleModalVisible}
                onCancel={() => {
                    setRoleModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={submitRoleChange}>
                    <p className="mb-4">Changing role for: <strong>{selectedMember?.user?.firstName} {selectedMember?.user?.lastName}</strong></p>
                    <Form.Item
                        name="role"
                        label="New Role"
                        rules={[{ required: true, message: 'Please select a role' }]}
                    >
                        <Select placeholder="Select role">
                            <Option value="ORGANIZATION_ADMIN">Admin</Option>
                            <Option value="ORGANIZATION_MANAGER">Manager</Option>
                            <Option value="EMPLOYEE">Employee</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item className="text-right mb-0">
                        <Space>
                            <Button onClick={() => setRoleModalVisible(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={roleMutation.isLoading}>
                                Update Role
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
