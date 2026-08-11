import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Form, Select, Button, Space, Tag, Tooltip } from 'antd';
import {
  Mail, UploadCloud, RefreshCw, XCircle, Clock, CheckCircle2,
  AlertTriangle, UserPlus, Users2, Send
} from 'lucide-react';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import { parse } from 'papaparse';

const { Option } = Select;

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', icon: Clock, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  ACCEPTED: { label: 'Accepted', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  REVOKED: { label: 'Revoked', icon: XCircle, color: 'bg-red-100 text-red-700 border-red-200' },
  EXPIRED: { label: 'Expired', icon: AlertTriangle, color: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const InvitationRow = ({ inv, onResend, onRevoke, resendLoading, revokeLoading }) => {
  const cfg = STATUS_CONFIG[inv.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = cfg.icon;

  return (
    <div className="group flex items-center justify-between gap-4 bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-2xl px-5 py-4 shadow-[0_2px_10px_rgb(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgb(0,0,0,0.07)] transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Mail className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-slate-800 truncate text-sm">{inv.email}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {inv.role?.replace('ORGANIZATION_', '') || 'Employee'}
            {inv.department && ` · ${inv.department}`}
            {inv.jobTitle && ` · ${inv.jobTitle}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${cfg.color}`}>
          <StatusIcon className="w-3 h-3" />
          {cfg.label}
        </span>

        {inv.expiresAt && (
          <span className="text-xs text-slate-400 hidden md:block">
            Expires {new Date(inv.expiresAt).toLocaleDateString()}
          </span>
        )}

        {inv.status === 'PENDING' && (
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Tooltip title="Resend Invitation">
              <button
                onClick={() => onResend(inv.id)}
                disabled={resendLoading}
                className="p-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
            <Tooltip title="Revoke Invitation">
              <button
                onClick={() => onRevoke(inv.id)}
                disabled={revokeLoading}
                className="p-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
};

export const OrganizationInvitationsPage = () => {
  const { id: orgId } = useParams();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [pageSize] = useState(15);
  const [singleInviteVisible, setSingleInviteVisible] = useState(false);
  const [bulkInviteVisible, setBulkInviteVisible] = useState(false);
  const [form] = Form.useForm();
  const [csvData, setCsvData] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['orgInvitations', orgId, page, pageSize],
    queryFn: async ({ queryKey }) => {
      const [_key, orgId, page, size] = queryKey;
      try {
        const response = await api.get(`/v1/organizations/${orgId}/invitations`, { params: { page, size } });
        return response.data;
      } catch {
        return { content: [], totalElements: 0 };
      }
    },
    keepPreviousData: true,
  });

  const inviteMutation = useMutation({
    mutationFn: (data) => api.post(`/v1/organizations/${orgId}/invitations`, data),
    onSuccess: () => {
      toast.success('Invitation sent!');
      setSingleInviteVisible(false);
      form.resetFields();
      queryClient.invalidateQueries(['orgInvitations', orgId]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to send invitation'),
  });

  const bulkInviteMutation = useMutation({
    mutationFn: (data) => api.post(`/v1/organizations/${orgId}/invitations/bulk`, data),
    onSuccess: () => {
      toast.success(`${csvData.length} invitations sent!`);
      setBulkInviteVisible(false);
      setCsvData([]);
      queryClient.invalidateQueries(['orgInvitations', orgId]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to send bulk invitations'),
  });

  const revokeMutation = useMutation({
    mutationFn: (id) => api.put(`/v1/organizations/${orgId}/invitations/${id}/revoke`),
    onSuccess: () => {
      toast.success('Invitation revoked');
      queryClient.invalidateQueries(['orgInvitations', orgId]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to revoke'),
  });

  const resendMutation = useMutation({
    mutationFn: (id) => api.put(`/v1/organizations/${orgId}/invitations/${id}/resend`),
    onSuccess: () => {
      toast.success('Invitation resent');
      queryClient.invalidateQueries(['orgInvitations', orgId]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to resend'),
  });

  const parseCsv = (file) => {
    parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data
          .map(row => ({
            email: row.email || row.Email,
            role: row.role || row.Role || 'EMPLOYEE',
            department: row.department || row.Department,
            jobTitle: row.jobTitle || row['Job Title'],
          }))
          .filter(r => r.email);
        if (parsed.length === 0) {
          toast.error('No valid emails in CSV. Ensure there is an "email" column.');
        } else {
          setCsvData(parsed);
          toast.success(`Found ${parsed.length} records.`);
        }
      },
      error: () => toast.error('Failed to parse CSV'),
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) parseCsv(file);
    else toast.error('Please drop a CSV file');
  };

  const invitations = data?.content || [];
  const total = data?.totalElements || 0;
  const pendingCount = invitations.filter(i => i.status === 'PENDING').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <Mail className="w-6 h-6" />
            </div>
            Invitations
          </h2>
          <p className="text-slate-500 mt-1 font-medium ml-1">
            {pendingCount} pending · {total} total
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setSingleInviteVisible(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-all shadow-sm"
          >
            <UserPlus className="w-4 h-4" /> Invite Member
          </button>
          <button
            onClick={() => setBulkInviteVisible(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 border-0 rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-md"
          >
            <Users2 className="w-4 h-4" /> Bulk Invite (CSV)
          </button>
        </div>
      </div>

      {/* Invitation List */}
      <div className="space-y-3">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-white/50 rounded-2xl border border-slate-200/60 animate-pulse" />
          ))
        ) : invitations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white/60 backdrop-blur-xl rounded-2xl border border-slate-200/60">
            <div className="p-5 bg-indigo-50 rounded-2xl mb-4">
              <Mail className="w-10 h-10 text-indigo-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">No invitations yet</h3>
            <p className="text-slate-500 text-sm mt-1">Send your first invitation to build your team.</p>
          </div>
        ) : (
          invitations.map((inv) => (
            <InvitationRow
              key={inv.id}
              inv={inv}
              onResend={(id) => resendMutation.mutate(id)}
              onRevoke={(id) => revokeMutation.mutate(id)}
              resendLoading={resendMutation.isPending}
              revokeLoading={revokeMutation.isPending}
            />
          ))
        )}
      </div>

      {/* Single Invite Modal */}
      <Modal
        title={<span className="text-base font-bold">Send Invitation</span>}
        open={singleInviteVisible}
        onCancel={() => { setSingleInviteVisible(false); form.resetFields(); }}
        footer={null}
        className="rounded-2xl overflow-hidden"
      >
        <Form form={form} layout="vertical" onFinish={(v) => inviteMutation.mutate(v)} className="mt-4">
          <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email', message: 'Valid email required' }]}>
            <input type="email" placeholder="employee@company.com" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none" />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Please select a role' }]} initialValue="EMPLOYEE">
            <Select size="large">
              <Option value="EMPLOYEE">Employee</Option>
              <Option value="ORGANIZATION_MANAGER">Manager</Option>
              <Option value="ORGANIZATION_ADMIN">Admin</Option>
            </Select>
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="department" label="Department">
              <input type="text" placeholder="Engineering" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
            </Form.Item>
            <Form.Item name="jobTitle" label="Job Title">
              <input type="text" placeholder="Software Engineer" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
            </Form.Item>
          </div>
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setSingleInviteVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={inviteMutation.isPending} icon={<Send className="w-4 h-4" />}>
                Send Invite
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Bulk Invite Modal */}
      <Modal
        title={<span className="text-base font-bold">Bulk Invite via CSV</span>}
        open={bulkInviteVisible}
        onCancel={() => { setBulkInviteVisible(false); setCsvData([]); }}
        footer={[
          <Button key="cancel" onClick={() => setBulkInviteVisible(false)}>Cancel</Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => csvData.length > 0 && bulkInviteMutation.mutate(csvData)}
            loading={bulkInviteMutation.isPending}
            disabled={csvData.length === 0}
          >
            Send {csvData.length > 0 ? `${csvData.length} ` : ''}Invitations
          </Button>
        ]}
        className="rounded-2xl overflow-hidden"
      >
        <div className="mt-4 space-y-4">
          <p className="text-sm text-slate-600">
            CSV must have column headers: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">email</code>,
            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs ml-1">role</code>,
            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs ml-1">department</code>,
            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs ml-1">jobTitle</code>.
            Only <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">email</code> is required.
          </p>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50'}`}
            onClick={() => document.getElementById('csv-upload').click()}
          >
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => e.target.files[0] && parseCsv(e.target.files[0])}
            />
            <UploadCloud className={`w-12 h-12 mx-auto mb-3 ${dragOver ? 'text-indigo-500' : 'text-slate-400'}`} />
            <p className="font-semibold text-slate-600">Drop CSV here or click to browse</p>
            <p className="text-xs text-slate-400 mt-1">Supports .csv files only</p>
          </div>

          {csvData.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <p className="text-sm font-semibold text-emerald-700">
                {csvData.length} valid records ready to invite.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
