import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axiosConfig';
import { 
  ArrowLeft, 
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  MoreVertical,
  Info,
  Upload,
  X,
  Lock
} from 'lucide-react';
import Button from '../../components/common/Button';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import TicketFeedbackForm from '../../components/support/TicketFeedbackForm';
import { Star } from 'lucide-react';

const SupportTicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [file, setFile] = useState(null);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchTicketAndMessages(true);
    const intervalId = setInterval(() => fetchTicketAndMessages(false), 5000);
    return () => clearInterval(intervalId);
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]); // Only scroll when number of messages changes

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTicketAndMessages = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const [ticketRes, messagesRes] = await Promise.all([
        axios.get(`/v1/tickets/${id}`),
        axios.get(`/v1/tickets/${id}/messages`)
      ]);
      setTicket(ticketRes.data);
      setMessages(messagesRes.data);
    } catch (error) {
      console.error('Failed to fetch ticket details:', error);
      if (showLoading) {
        toast.error('Failed to load ticket details');
        navigate('/dashboard/support');
      }
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !file) return;

    try {
      setIsSending(true);
      const data = new FormData();
      data.append('data', new Blob([JSON.stringify({
        content: newMessage,
        isInternal: false
      })], { type: 'application/json' }));

      if (file) {
        data.append('file', file);
      }

      const response = await axios.post(`/v1/tickets/${id}/messages`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setMessages([...messages, response.data]);
      setNewMessage('');
      setFile(null);
      
      // If we're replying to a resolved/closed/waiting ticket, update the local status since backend auto-reopens
      if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' || ticket.status === 'WAITING_FOR_USER') {
        setTicket({ ...ticket, status: 'REOPENED' });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleCloseTicket = async () => {
    try {
      await axios.patch(`/v1/tickets/${id}/close`);
      setTicket({ ...ticket, status: 'CLOSED' });
      toast.success('Ticket closed successfully');
    } catch (error) {
      console.error('Failed to close ticket:', error);
      toast.error('Failed to close ticket');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CLOSED': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'REOPENED': return 'bg-purple-100 text-purple-800 border-purple-200';
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
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
        <button 
          onClick={() => navigate('/dashboard/support')}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tickets
        </button>
        
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
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
            <p className="text-sm text-slate-500 mt-1">
              Category: <span className="font-medium text-slate-700">{ticket.category.replace('_', ' ')}</span>
            </p>
          </div>
          
          {ticket.status !== 'CLOSED' && (
            <button 
              onClick={handleCloseTicket}
              className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium rounded-lg text-sm transition-colors mt-2 sm:mt-0"
            >
              Close Ticket
            </button>
          )}
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/30">
        {/* Initial Ticket Description */}
        <div className="flex gap-4 max-w-3xl">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
            <User className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-slate-900">{ticket.authorName}</span>
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

        {/* Messages */}
        {messages.map((msg) => {
          const isMe = msg.authorName === (user?.firstName + ' ' + user?.lastName);
          const isStaff = msg.authorRole !== 'USER';
          
          return (
            <div key={msg.id} className={`flex gap-4 max-w-3xl ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${
                isStaff 
                  ? 'bg-blue-100 border-blue-200' 
                  : isMe ? 'bg-emerald-100 border-emerald-200' : 'bg-slate-100 border-slate-200'
              }`}>
                {isStaff ? (
                  <Info className="w-5 h-5 text-blue-600" />
                ) : (
                  <User className={`w-5 h-5 ${isMe ? 'text-emerald-600' : 'text-slate-600'}`} />
                )}
              </div>
              <div className={`flex-1 ${isMe ? 'flex flex-col items-end' : ''}`}>
                <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <span className="font-semibold text-slate-900">
                    {msg.authorName} {isStaff && <span className="text-xs font-medium bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded ml-1">Staff</span>}
                  </span>
                  <span className="text-xs text-slate-400">{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
                <div className={`p-4 rounded-2xl shadow-sm text-slate-700 whitespace-pre-wrap border ${
                  isMe 
                    ? 'bg-emerald-50 border-emerald-100 rounded-tr-none' 
                    : isStaff ? 'bg-blue-50 border-blue-100 rounded-tl-none' : 'bg-white border-slate-200 rounded-tl-none'
                }`}>
                  {msg.content}
                  {msg.attachmentUrl && (
                    <div className="mt-3 pt-3 border-t border-slate-200/60">
                      <a 
                        href={msg.attachmentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-white/50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        View Attachment
                      </a>
                    </div>
                  )}
                </div>
                {isMe && (
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

      {/* Reply Area or Feedback */}
      <div className="p-4 sm:p-6 border-t border-slate-100 bg-white flex-shrink-0">
        {(ticket.status === 'CLOSED' || ticket.status === 'RESOLVED') ? (
          <div>
            {ticket.hasFeedback ? (
              <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-center mb-3 text-emerald-500">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Feedback Submitted</h3>
                <p className="text-sm text-slate-500">Thank you for helping us improve our support.</p>
              </div>
            ) : (
              <TicketFeedbackForm 
                ticketId={ticket.id} 
                onSuccess={() => setTicket({ ...ticket, hasFeedback: true })} 
              />
            )}
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
            {file && (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg self-start">
                <span className="text-xs font-medium truncate max-w-[200px]">{file.name}</span>
                <button type="button" onClick={() => setFile(null)} className="hover:text-emerald-900">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="flex gap-4">
              <label className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                <Upload className="w-5 h-5 text-slate-500" />
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => {
                    const selected = e.target.files[0];
                    if (selected && selected.size <= 5 * 1024 * 1024) setFile(selected);
                    else if (selected) toast.error('File must be under 5MB');
                  }}
                  accept="image/*,.pdf"
                />
              </label>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your reply..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900"
                disabled={isSending}
              />
              <Button 
                type="submit"
                disabled={(!newMessage.trim() && !file) || isSending}
                className="flex-shrink-0 flex items-center justify-center w-12 h-12 !p-0 rounded-xl"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SupportTicketDetail;
