import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function TicketSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const ticketNumber = location.state?.ticketNumber;

  if (!ticketNumber) {
    return <Navigate to="/dashboard/support" replace />;
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-3xl p-8 text-center border border-slate-200 shadow-sm">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Ticket Submitted!</h1>
        <p className="text-slate-600 mb-6">
          We've received your request. Our support team will get back to you as soon as possible.
        </p>
        
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8">
          <p className="text-sm text-slate-500 font-medium mb-1">Your Ticket Number</p>
          <p className="text-2xl font-mono font-bold text-emerald-600">{ticketNumber}</p>
        </div>

        <button
          onClick={() => navigate('/dashboard/support')}
          className="w-full bg-emerald-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center"
        >
          View Ticket History
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
}
