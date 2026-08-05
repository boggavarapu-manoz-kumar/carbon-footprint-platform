import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAxios as axios } from '../../../core/api';
import { useAuth } from '../../../core/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  Info,
  Lock,
  Star,
  Upload
} from 'lucide-react';

export const AdminTicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchTicketAndMessages(true);
    const intervalId = setInterval(() => fetchTicketAndMessages(false), 5000);
    return () => clearInterval(intervalId);
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTicketAndMessages = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const [ticketRes, messagesRes] = await Promise.all([
        axios.get(`/tickets/${id}`),
        axios.get(`/tickets/${id}/messages`)
      ]);
      setTicket(ticketRes.data);
      setMessages(messagesRes.data);
      
      if (ticketRes.data.hasFeedback) {
        try {
          const feedbackRes = await axios.get(`/tickets/${id}/feedback`);
          setFeedback(feedbackRes.data);
        } catch (err) {
          console.error('Failed to fetch feedback:', err);
        }
      }
    } catch (error) {
      console.error('Failed to fetch ticket details:', error);
      if (showLoading) {
        navigate('/support');
      }
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setIsSending(true);
      const formData = new FormData();
      formData.append('data', new Blob([JSON.stringify({
        content: newMessage,
        isInternal: isInternal
      })], { type: 'application/json' }));

      const response = await axios.post(`/tickets/${id}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.put(`/tickets/${id}/status`, { status: newStatus });
      setTicket({ ...ticket, status: newStatus });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleAssignToMe = async () => {
    try {
      await axios.put(`/tickets/${id}/assign?adminId=${user.id}`);
      setTicket({ ...ticket, assignedToName: user.firstName + ' ' + user.lastName });
      toast.success('Ticket assigned to you');
    } catch (error) {
      console.error('Failed to assign ticket:', error);
      toast.error('Failed to assign ticket');
    }
  };

  const handleEscalate = async () => {
    try {
      const res = await axios.patch(`/tickets/${id}/escalate`);
      setTicket(res.data);
      toast.success('Ticket priority escalated');
    } catch (error) {
      console.error('Failed to escalate ticket:', error);
      toast.error('Failed to escalate ticket');
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="p-6 max-w-5xl mx-auto h-[calc(100vh-64px)] flex flex-col">
      <div className="flex-shrink-0 bg-white rounded-t-2xl border border-b-0 border-slate-200 shadow-sm p-4 sm:p-6">
        <button 
          onClick={() => navigate('/support')}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tickets
        </button>
        
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-medium text-slate-500">#{ticket.ticketNumber || ticket.id}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                {ticket.status.replace('_', ' ')}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                {getPriorityIcon(ticket.priority)}
                {ticket.priority}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{ticket.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
              <span className="text-slate-500">
                Author: <span className="font-medium text-slate-700">{ticket.authorName}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">
                Category: <span className="font-medium text-slate-700">{ticket.category.replace('_', ' ')}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">
                Assigned To: <span className="font-medium text-slate-700">{ticket.assignedToName}</span>
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {ticket.assignedToName === 'Unassigned' && (
              <button 
                onClick={handleAssignToMe}
                className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium rounded-lg text-sm transition-colors"
              >
                Assign to Me
              </button>
            )}

            {ticket.priority !== 'CRITICAL' && ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
              <button 
                onClick={handleEscalate}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-rose-600 font-medium rounded-lg text-sm transition-colors"
              >
                Escalate
              </button>
            )}
            
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900 text-sm font-medium"
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="WAITING_FOR_USER">Waiting for User</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50 border-x border-slate-200">
        <div className="flex gap-4 max-w-3xl">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center border border-slate-300">
            <User className="w-5 h-5 text-slate-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-slate-900">{ticket.authorName}</span>
              <span className="text-xs font-medium bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">User</span>
              <span className="text-xs text-slate-400">{new Date(ticket.createdAt).toLocaleString()}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm text-slate-700 whitespace-pre-wrap">
              {ticket.description}
              {ticket.attachmentUrl && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <a 
                    href={ticket.attachmentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    View Attachment
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {feedback && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 sm:p-6 my-6 shadow-sm">
            <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              Customer Feedback
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Overall Satisfaction</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-4 h-4 ${star <= feedback.overallSatisfaction ? 'fill-amber-400 text-amber-400' : 'text-emerald-200'}`} 
                    />
                  ))}
                </div>
              </div>
              <div>
                <span className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Support Quality</span>
                <span className="font-semibold text-emerald-900">{feedback.supportQuality}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Response Time</span>
                <span className="font-semibold text-emerald-900">{feedback.responseTime}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Problem Resolution</span>
                <span className="font-semibold text-emerald-900">{feedback.problemResolution}</span>
              </div>
            </div>
            {feedback.comments && (
              <div className="mt-4 pt-4 border-t border-emerald-200/50">
                <span className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">Additional Comments</span>
                <p className="text-emerald-900 bg-white/50 p-3 rounded-lg border border-emerald-100/50 italic">"{feedback.comments}"</p>
              </div>
            )}
          </div>
        )}

        {messages.map((msg) => {
          const isStaff = msg.authorRole !== 'USER';
          const isInternalMsg = msg.internal;
          
          return (
            <div key={msg.id} className={`flex gap-4 max-w-3xl ${isStaff && !isInternalMsg ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${
                isInternalMsg ? 'bg-amber-100 border-amber-200' :
                isStaff ? 'bg-blue-100 border-blue-200' : 'bg-slate-200 border-slate-300'
              }`}>
                {isInternalMsg ? (
                  <Lock className="w-5 h-5 text-amber-600" />
                ) : isStaff ? (
                  <Info className="w-5 h-5 text-blue-600" />
                ) : (
                  <User className="w-5 h-5 text-slate-600" />
                )}
              </div>
              <div className={`flex-1 ${isStaff && !isInternalMsg ? 'flex flex-col items-end' : ''}`}>
                <div className={`flex items-center gap-2 mb-1 ${isStaff && !isInternalMsg ? 'flex-row-reverse' : ''}`}>
                  <span className="font-semibold text-slate-900">
                    {msg.authorName}
                  </span>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                    isStaff ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {msg.authorRole}
                  </span>
                  {isInternalMsg && (
                    <span className="text-xs font-medium bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Internal Note
                    </span>
                  )}
                  <span className="text-xs text-slate-400">{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
                <div className={`p-4 rounded-2xl shadow-sm text-slate-700 whitespace-pre-wrap border ${
                  isInternalMsg ? 'bg-amber-50 border-amber-100 rounded-tr-none' :
                  isStaff ? 'bg-blue-50 border-blue-100 rounded-tr-none' : 'bg-white border-slate-200 rounded-tl-none'
                }`}>
                  {msg.content}
                  {msg.attachmentUrl && (
                    <div className="mt-3 pt-3 border-t border-slate-200/60">
                      <a 
                        href={msg.attachmentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium rounded-lg transition-colors text-slate-700 hover:text-slate-900"
                      >
                        <Upload className="w-4 h-4" /> View Attachment
                      </a>
                    </div>
                  )}
                </div>
                {isStaff && !isInternalMsg && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-slate-400 mr-1">
                    {msg.read ? (
                      <span className="flex items-center gap-1 text-emerald-500 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Read
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-shrink-0 bg-white p-4 sm:p-6 border border-t-0 border-slate-200 rounded-b-2xl">
        <form onSubmit={handleSendMessage} className="space-y-4">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                <Lock className="w-4 h-4 text-slate-400" />
                Internal Note (hidden from user)
              </span>
            </label>
          </div>
          <div className="flex gap-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isInternal ? "Type an internal note..." : "Type a reply to the user..."}
              className={`flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 ${
                isInternal 
                  ? 'bg-amber-50 border-amber-200 focus:border-amber-500 placeholder:text-amber-400/70' 
                  : 'bg-slate-50 border-slate-200 focus:border-emerald-500'
              }`}
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className={`flex-shrink-0 flex items-center justify-center px-6 py-3 rounded-xl font-medium text-white transition-colors ${
                isInternal
                  ? 'bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300'
                  : 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400'
              }`}
            >
              <Send className="w-5 h-5 mr-2" />
              {isInternal ? 'Add Note' : 'Send Reply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
