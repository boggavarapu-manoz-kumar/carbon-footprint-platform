import React, { useState } from 'react';
import { Table, Button, Space, Tag, Dropdown, Menu, Modal, Input, message } from 'antd';
import { MoreOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { format } from 'date-fns';

const { confirm } = Modal;

export const OrganizationMembersTable = ({ 
    members, loading, total, currentPage, pageSize, search,
    onSearchChange, onTableChange, onInvite, onRemove, onSuspend, onReactivate, onChangeRole 
}) => {

    const handleMenuClick = (key, record) => {
        switch (key) {
            case 'suspend':
                confirm({
                    title: `Are you sure you want to suspend ${record.user.firstName}?`,
                    content: 'They will instantly lose access to the organization dashboard. Their personal account remains active.',
                    onOk: () => onSuspend(record.id)
                });
                break;
            case 'reactivate':
                onReactivate(record.id);
                break;
            case 'remove':
                confirm({
                    title: `Remove ${record.user.firstName} from the organization?`,
                    content: 'This will revoke their organization membership. Their personal account and activity data will not be deleted.',
                    okType: 'danger',
                    onOk: () => onRemove(record.id)
                });
                break;
            case 'changeRole':
                // Open change role modal (implemented by parent or another component)
                onChangeRole(record);
                break;
            default:
                break;
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: ['user', 'firstName'],
            key: 'name',
            render: (text, record) => `${record.user.firstName} ${record.user.lastName}`,
            sorter: (a, b) => a.user.firstName.localeCompare(b.user.firstName),
        },
        {
            title: 'Email',
            dataIndex: ['user', 'email'],
            key: 'email',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={role === 'ORGANIZATION_OWNER' ? 'purple' : role === 'ORGANIZATION_ADMIN' ? 'geekblue' : 'default'}>
                    {role.replace('ORGANIZATION_', '')}
                </Tag>
            ),
            filters: [
                { text: 'Owner', value: 'ORGANIZATION_OWNER' },
                { text: 'Admin', value: 'ORGANIZATION_ADMIN' },
                { text: 'Manager', value: 'ORGANIZATION_MANAGER' },
                { text: 'Employee', value: 'EMPLOYEE' },
            ],
            onFilter: (value, record) => record.role === value,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'ACTIVE' ? 'success' : 'error'}>
                    {status}
                </Tag>
            ),
        },
        {
            title: 'Joined Date',
            dataIndex: 'joinedAt',
            key: 'joinedAt',
            render: (date) => date ? format(new Date(date), 'MMM dd, yyyy') : '-',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => {
                const menu = (
                    <Menu onClick={({ key }) => handleMenuClick(key, record)}>
                        {record.status === 'ACTIVE' ? (
                            <Menu.Item key="suspend">Suspend Membership</Menu.Item>
                        ) : (
                            <Menu.Item key="reactivate">Reactivate Membership</Menu.Item>
                        )}
                        <Menu.Item key="changeRole">Change Role</Menu.Item>
                        <Menu.Divider />
                        <Menu.Item key="remove" danger>Remove from Organization</Menu.Item>
                    </Menu>
                );

                return (
                    <Dropdown overlay={menu} trigger={['click']}>
                        <Button type="text" icon={<MoreOutlined />} />
                    </Dropdown>
                );
            }
        }
    ];

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <Input
                    placeholder="Search members..."
                    prefix={<SearchOutlined className="text-gray-400" />}
                    value={search}
                    onChange={e => onSearchChange(e.target.value)}
                    className="max-w-md"
                    allowClear
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={onInvite}>
                    Invite Member
                </Button>
            </div>
            
            <Table
                columns={columns}
                dataSource={members}
                rowKey="id"
                loading={loading}
                onChange={onTableChange}
                pagination={{ 
                    current: currentPage,
                    pageSize: pageSize,
                    total: total,
                    showSizeChanger: true 
                }}
            />
        </div>
    );
};
