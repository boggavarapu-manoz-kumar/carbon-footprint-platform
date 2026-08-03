import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAxios as axios } from '../../../core/api';
import { useAuth } from '../../../core/AuthContext'; 
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  MoreVertical,
  Activity,
  Calendar,
  Star,
  ThumbsUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export const SupportTicketManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [adminFilter, setAdminFilter] = useState('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState('ALL');

  const fetchData = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setIsLoading(true);
      
      const [ticketsRes, statsRes, adminsRes, feedbackRes] = await Promise.all([
        axios.get('/v1/tickets'),
        axios.get('/v1/tickets/stats'),
        axios.get('/v1/users/roles?roles=SUPER_ADMIN,ADMIN,SUPPORT_TEAM'),
        axios.get('/v1/tickets/feedback/stats')
      ]);
      
      setTickets(ticketsRes.data);
      setStats(statsRes.data);
      setFeedbackStats(feedbackRes.data);
      if (adminsRes.data) {
        setAdmins(adminsRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch ticket data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch and real-time polling setup
  useEffect(() => {
    fetchData(true);
    const intervalId = setInterval(() => fetchData(false), 10000);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const handleEscalate = async (ticketId, e) => {
    e.stopPropagation();
    try {
      await axios.patch(`/v1/tickets/${ticketId}/escalate`);
      toast.success('Ticket escalated successfully');
      fetchData(false);
    } catch (error) {
      toast.error('Failed to escalate ticket');
    }
  };

  const handleAssignToMe = async (ticketId, e) => {
    e.stopPropagation();
    try {
      await axios.put(`/v1/tickets/${ticketId}/assign?adminId=${user.id}`);
      toast.success('Ticket assigned to you');
      fetchData(false);
    } catch (error) {
      toast.error('Failed to assign ticket');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'WAITING_FOR_USER': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CLOSED': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'REOPENED': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'CRITICAL': return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case 'HIGH': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'MEDIUM': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'LOW': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default: return null;
    }
  };

  const isOverdue = (ticket) => {
    if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') return false;
    const updated = new Date(ticket.updatedAt);
    const now = new Date();
    return (now - updated) > 24 * 60 * 60 * 1000;
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      // Search
      const matchesSearch = 
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.ticketNumber && ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ticket.id.toString().includes(searchTerm) ||
        ticket.authorName.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status
      const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
      
      // Priority
      const matchesPriority = priorityFilter === 'ALL' || ticket.priority === priorityFilter;

      // Category
      const matchesCategory = categoryFilter === 'ALL' || ticket.category === categoryFilter;

      // Admin
      let matchesAdmin = true;
      if (adminFilter === 'UNASSIGNED') matchesAdmin = ticket.assignedToName === 'Unassigned';
      else if (adminFilter !== 'ALL') matchesAdmin = ticket.assignedToName === adminFilter;

      // Date
      let matchesDate = true;
      if (dateRangeFilter !== 'ALL') {
        const created = new Date(ticket.createdAt);
        const now = new Date();
        const diffDays = (now - created) / (1000 * 60 * 60 * 24);
        if (dateRangeFilter === 'TODAY') matchesDate = diffDays <= 1;
        if (dateRangeFilter === 'WEEK') matchesDate = diffDays <= 7;
        if (dateRangeFilter === 'MONTH') matchesDate = diffDays <= 30;
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesAdmin && matchesDate;
    });
  }, [tickets, searchTerm, statusFilter, priorityFilter, categoryFilter, adminFilter, dateRangeFilter]);

  const StatCard = ({ title, value, icon, color, highlight }) => (
    <div className={`p-4 rounded-xl border ${highlight ? `bg-${color}-50 border-${color}-200` : 'bg-white border-slate-200'} shadow-sm flex items-center justify-between`}>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className={`text-2xl font-bold mt-1 ${highlight ? `text-${color}-700` : 'text-slate-900'}`}>
          {value !== undefined ? value : '-'}
        </p>
      </div>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${highlight ? `bg-${color}-100` : 'bg-slate-50'}`}>
        {icon}
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-600" />
            Support Ticket Management
          </h1>
          <p className="text-slate-500 mt-1">Real-time dashboard for resolving support requests.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
          <Activity className="w-4 h-4 animate-pulse" /> Live
        </div>
      </div>

      {/* Stats Dashboard */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <StatCard title="Total" value={stats.totalTickets} icon={<MessageSquare className="w-5 h-5 text-slate-400" />} />
          <StatCard title="Open" value={stats.open} icon={<AlertCircle className="w-5 h-5 text-blue-500" />} />
          <StatCard title="In Progress" value={stats.inProgress} icon={<Activity className="w-5 h-5 text-amber-500" />} />
          <StatCard title="Waiting" value={tickets.filter(t => t.status === 'WAITING_FOR_USER').length} icon={<Clock className="w-5 h-5 text-purple-500" />} />
          <StatCard title="Resolved" value={stats.resolved} icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} />
          <StatCard title="High Priority" value={stats.highPriority} highlight color="orange" icon={<AlertCircle className="w-5 h-5 text-orange-600" />} />
          <StatCard title="Overdue" value={stats.overdue} highlight color="rose" icon={<Clock className="w-5 h-5 text-rose-600" />} />
        </div>
      )}

      {/* Feedback Analytics */}
      {feedbackStats && feedbackStats.totalFeedback > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Average Rating</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-2xl font-bold text-slate-900">{feedbackStats.averageRating.toFixed(1)}</p>
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Customer Satisfaction</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{feedbackStats.customerSatisfactionScore}%</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <ThumbsUp className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Feedback</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{feedbackStats.totalFeedback}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, title, or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900"
            />
          </div>
          <div className="flex flex-wrap gap-2 lg:flex-nowrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-3 pr-8 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm appearance-none bg-white min-w-[140px]"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="WAITING_FOR_USER">Waiting for User</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="pl-3 pr-8 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm appearance-none bg-white min-w-[120px]"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <select
              value={adminFilter}
              onChange={(e) => setAdminFilter(e.target.value)}
              className="pl-3 pr-8 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm appearance-none bg-white min-w-[140px]"
            >
              <option value="ALL">All Agents</option>
              <option value="UNASSIGNED">Unassigned</option>
              {admins.map(a => (
                <option key={a.id} value={`${a.firstName} ${a.lastName}`}>{a.firstName} {a.lastName}</option>
              ))}
            </select>
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              className="pl-3 pr-8 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm appearance-none bg-white min-w-[120px]"
            >
              <option value="ALL">Any Time</option>
              <option value="TODAY">Last 24h</option>
              <option value="WEEK">Past Week</option>
              <option value="MONTH">Past Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-900">ID</th>
                <th className="px-6 py-4 font-semibold text-slate-900">User</th>
                <th className="px-6 py-4 font-semibold text-slate-900">Title</th>
                <th className="px-6 py-4 font-semibold text-slate-900">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-900">Priority</th>
                <th className="px-6 py-4 font-semibold text-slate-900">Assigned To</th>
                <th className="px-6 py-4 font-semibold text-slate-900">Last Updated</th>
                <th className="px-6 py-4 font-semibold text-slate-900 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && tickets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                    No tickets found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    onClick={() => navigate(`/admin/support/${ticket.id}`)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-slate-500 font-medium">#{ticket.ticketNumber || ticket.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{ticket.authorName}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="max-w-[200px] truncate text-slate-900 font-medium" title={ticket.title}>
                          {ticket.title}
                        </div>
                        {isOverdue(ticket) && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 uppercase">
                            Overdue
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        {getPriorityIcon(ticket.priority)}
                        <span className="capitalize">{ticket.priority.toLowerCase()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {ticket.assignedToName === 'Unassigned' ? (
                        <span className="text-slate-400 italic">Unassigned</span>
                      ) : (
                        <span className="font-medium text-slate-700">{ticket.assignedToName}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(ticket.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {ticket.assignedToName === 'Unassigned' && ticket.status !== 'CLOSED' && (
                        <button
                          onClick={(e) => handleAssignToMe(ticket.id, e)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                        >
                          Assign Me
                        </button>
                      )}
                      {ticket.priority !== 'CRITICAL' && ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
                        <button
                          onClick={(e) => handleEscalate(ticket.id, e)}
                          className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-rose-600 rounded-lg text-sm font-medium transition-colors"
                        >
                          Escalate
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
