import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import Button from '../common/Button';
import { toast } from 'react-hot-toast';
import axios from '../../api/axiosConfig';

export const TicketFeedbackForm = ({ ticketId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [supportQuality, setSupportQuality] = useState('');
  const [responseTime, setResponseTime] = useState('');
  const [problemResolution, setProblemResolution] = useState('');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select an overall rating');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const data = {
        overallSatisfaction: rating,
        supportQuality,
        responseTime,
        problemResolution,
        comments
      };
      
      await axios.post(`/v1/tickets/${ticketId}/feedback`, data);
      toast.success('Thank you for your feedback!');
      if (onSuccess) onSuccess(data);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-2xl mx-auto my-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2">How did we do?</h2>
        <p className="text-sm text-slate-500">We'd love to hear your feedback on how we handled your ticket.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <label className="text-sm font-medium text-slate-700">Overall Satisfaction *</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star 
                  className={`w-10 h-10 ${
                    star <= (hoverRating || rating) 
                      ? 'fill-amber-400 text-amber-400' 
                      : 'text-slate-200'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Support Quality *</label>
            <select 
              required
              value={supportQuality}
              onChange={(e) => setSupportQuality(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700"
            >
              <option value="">Select an option</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Average">Average</option>
              <option value="Poor">Poor</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Response Time *</label>
            <select 
              required
              value={responseTime}
              onChange={(e) => setResponseTime(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700"
            >
              <option value="">Select an option</option>
              <option value="Very Fast">Very Fast</option>
              <option value="Appropriate">Appropriate</option>
              <option value="Slow">Slow</option>
              <option value="Unacceptable">Unacceptable</option>
            </select>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Problem Resolution *</label>
            <select 
              required
              value={problemResolution}
              onChange={(e) => setProblemResolution(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700"
            >
              <option value="">Select an option</option>
              <option value="Fully Resolved">Fully Resolved</option>
              <option value="Partially Resolved">Partially Resolved</option>
              <option value="Not Resolved">Not Resolved</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Additional Comments</label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
            placeholder="Tell us what you liked or how we can improve..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 resize-none"
          />
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2"
        >
          {isSubmitting ? 'Submitting...' : (
            <>
              Submit Feedback <Send className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default TicketFeedbackForm;
