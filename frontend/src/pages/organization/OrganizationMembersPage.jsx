import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Form, Select, Button, Space, Tag, Avatar, Tooltip } from 'antd';
import {
  Users, Search, UserCheck, UserX, Trash2, ShieldCheck,
  ChevronLeft, ChevronRight, Briefcase, Crown
} from 'lucide-react';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';

const { Option } = Select;

const ROLE_CONFIG = {
  ORGANIZATION_ADMIN: { label: 'Admin', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Crown },
  ORGANIZATION_MANAGER: { label: 'Manager', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: ShieldCheck },
  EMPLOYEE: { label: 'Employee', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Briefcase },
};

const STATUS_CONFIG = {
  ACTIVE: { label: 'Active', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  SUSPENDED: { label: 'Suspended', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

const MemberCard = ({ member, onSuspend, onReactivate, onRemove, onChangeRole, loading }) => {
  const role = ROLE_CONFIG[member.role] || ROLE_CONFIG.EMPLOYEE;
  const status = STATUS_CONFIG[member.status] || STATUS_CONFIG.ACTIVE;
  const RoleIcon = role.icon;
  const initials = `${member.user?.firstName?.[0] || ''}${member.user?.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="group relative bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-5 shadow-[0_2px_15px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-100/50 to-transparent rounded-tr-2xl rounded-bl-full pointer-events-none" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            <Avatar
              size={44}
              src={member.user?.profilePictureUrl}
              className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-bold shadow-md"
            >
              {initials}
            </Avatar>
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${status.dot}`} />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-800 truncate">
              {member.user?.firstName} {member.user?.lastName}
            </p>
            <p className="text-xs text-slate-500 truncate">{member.user?.email}</p>
          </div>
        </div>

        <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${role.color}`}>
            <RoleIcon className="w-3 h-3" />
            {role.label}
          </span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${status.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>
      </div>

      {(member.department || member.jobTitle) && (
        <div className="mt-3 flex gap-2 text-xs text-slate-500 font-medium">
          {member.department && <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">{member.department}</span>}
          {member.jobTitle && <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">{member.jobTitle}</span>}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {member.status === 'ACTIVE' ? (
          <Tooltip title="Suspend Member">
            <button
              onClick={() => onSuspend(member.id)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50"
            >
              <UserX className="w-3.5 h-3.5" /> Suspend
            </button>
          </Tooltip>
        ) : (
          <Tooltip title="Reactivate Member">
            <button
              onClick={() => onReactivate(member.id)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
            >
              <UserCheck className="w-3.5 h-3.5" /> Reactivate
            </button>
          </Tooltip>
        )}
        <Tooltip title="Change Role">
          <button
            onClick={() => onChangeRole(member)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Role
          </button>
        </Tooltip>
        <Tooltip title="Remove Member">
          <button
            onClick={() => {
              Modal.confirm({
                title: 'Remove Member?',
                content: `Remove ${member.user?.firstName} ${member.user?.lastName} from this organization?`,
                okText: 'Remove',
                okType: 'danger',
                onOk: () => onRemove(member.id),
              });
            }}
            disabled={loading}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export const OrganizationMembersPage = () => {
  const { id: orgId } = useParams();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [pageSize] = useState(12);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['orgMembers', orgId, page, pageSize, search],
    queryFn: async ({ queryKey }) => {
      const [_key, orgId, page, size, search] = queryKey;
      const response = await api.get(`/v1/organizations/${orgId}/members`, {
        params: { page, size, search: search || undefined }
      });
      return response.data;
    },
    keepPreviousData: true,
  });

  const statusMutation = useMutation({
    mutationFn: ({ memberId, status }) => api.put(`/v1/organizations/${orgId}/members/${memberId}/status`, { status }),
    onSuccess: () => {
      toast.success('Member status updated');
      queryClient.invalidateQueries(['orgMembers', orgId]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update status'),
  });

  const removeMutation = useMutation({
    mutationFn: (memberId) => api.delete(`/v1/organizations/${orgId}/members/${memberId}`),
    onSuccess: () => {
      toast.success('Member removed');
      queryClient.invalidateQueries(['orgMembers', orgId]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to remove member'),
  });

  const roleMutation = useMutation({
    mutationFn: ({ memberId, role }) => api.put(`/v1/organizations/${orgId}/members/${memberId}/role`, { role }),
    onSuccess: () => {
      toast.success('Role updated');
      setRoleModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries(['orgMembers', orgId]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update role'),
  });

  const members = data?.content || [];
  const total = data?.totalElements || 0;
  const totalPages = Math.ceil(total / pageSize);
  const isMutating = statusMutation.isPending || removeMutation.isPending;

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setSearch(searchInput);
      setPage(0);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            Organization Members
          </h2>
          <p className="text-slate-500 mt-1 font-medium ml-1">
            {total > 0 ? `${total} member${total !== 1 ? 's' : ''} total` : 'No members yet'}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
          />
        </div>
      </div>

      {/* Members Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white/50 rounded-2xl border border-slate-200/60 p-5 h-36 animate-pulse">
              <div className="flex gap-3">
                <div className="w-11 h-11 bg-slate-200 rounded-full" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white/60 backdrop-blur-xl rounded-2xl border border-slate-200/60">
          <div className="p-5 bg-slate-50 rounded-2xl mb-4">
            <Users className="w-12 h-12 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">No members found</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm">
            {search ? `No members matching "${search}"` : 'Invite your first employee to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              loading={isMutating}
              onSuspend={(id) => statusMutation.mutate({ memberId: id, status: 'SUSPENDED' })}
              onReactivate={(id) => statusMutation.mutate({ memberId: id, status: 'ACTIVE' })}
              onRemove={(id) => removeMutation.mutate(id)}
              onChangeRole={(m) => {
                setSelectedMember(m);
                form.setFieldsValue({ role: m.role });
                setRoleModalVisible(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <span className="text-sm font-semibold text-slate-600 px-4">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      )}

      {/* Role Change Modal */}
      <Modal
        title={
          <span className="text-base font-bold text-slate-800">
            Change Role — {selectedMember?.user?.firstName} {selectedMember?.user?.lastName}
          </span>
        }
        open={roleModalVisible}
        onCancel={() => { setRoleModalVisible(false); form.resetFields(); }}
        footer={null}
        className="rounded-2xl overflow-hidden"
      >
        <Form form={form} layout="vertical" onFinish={(v) => roleMutation.mutate({ memberId: selectedMember.id, role: v.role })}>
          <Form.Item name="role" label="New Role" rules={[{ required: true }]}>
            <Select placeholder="Select role" size="large">
              <Option value="ORGANIZATION_ADMIN">Admin</Option>
              <Option value="ORGANIZATION_MANAGER">Manager</Option>
              <Option value="EMPLOYEE">Employee</Option>
            </Select>
          </Form.Item>
          <Form.Item className="text-right mb-0">
            <Space>
              <Button onClick={() => setRoleModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={roleMutation.isPending}>Update Role</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
