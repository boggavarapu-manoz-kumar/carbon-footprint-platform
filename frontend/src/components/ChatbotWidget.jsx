import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, HelpCircle, Trash2, Activity, Target, Trophy, Mic, MicOff, Download, PieChart as PieChartIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { generateCarbonReport } from '../utils/ReportGenerator';

export const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I am your Carbon Footprint Platform Assistant. Ask me anything about your carbon stats, logged activities, goals, achievements, or platform features!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize Speech Recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      // Optional: Auto-send after speaking
      // handleSend(transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  }

  const suggestionChips = [
    "What was my footprint this week?",
    "Show me a breakdown of my footprint",
    "Download my carbon report PDF",
    "What is my current organization ranking?"
  ];

  const playPopSound = () => {
    try {
      if (window.AudioContext || window.webkitAudioContext) {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.1);
      }
    } catch (e) {
      // Ignore audio errors
    }
  };

  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate([50]);
    }
  };

  // Fetch History on Open
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const baseURL = getBaseURL();
        const token = await getValidToken();
        
        if (token) {
          const res = await fetch(`${baseURL}/v1/chatbot/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.length > 0) {
              const formattedHistory = data.map(msg => ({
                sender: msg.role === 'user' ? 'user' : 'bot',
                text: msg.content,
                time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }));
              
              setMessages([
                {
                  sender: 'bot',
                  text: "Hello! I am your Carbon Footprint Platform Assistant. Your previous conversation has been loaded.",
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                },
                ...formattedHistory
              ]);
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch chat history", e);
      }
    };

    if (isOpen && messages.length === 1) { // Only fetch if we haven't loaded anything else yet
      fetchHistory();
      inputRef.current?.focus();
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const toggleListen = () => {
    if (!recognition) return alert("Speech recognition is not supported in this browser.");
    if (isListening) {
      recognition.stop();
    } else {
      triggerHaptic();
      recognition.start();
      setIsListening(true);
    }
  };

  const getBaseURL = () => {
    const hostname = window.location.hostname;
    return import.meta.env.VITE_API_URL || `http://${hostname}:8081/api`;
  };

  /**
   * Decodes a JWT payload safely, handling base64url encoding.
   * Returns expiry timestamp in ms, or null if undecodable.
   */
  const decodeJwtExpiry = (token) => {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
      const payload = JSON.parse(atob(padded));
      return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  };

  /**
   * Attempts a silent token refresh using the stored refresh token.
   * Returns new access token on success, null on any failure.
   * NEVER throws.
   */
  const tryRefresh = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return null;
      const baseURL = getBaseURL();
      const resp = await fetch(`${baseURL}/v1/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
      if (!resp.ok) return null;
      const json = await resp.json();
      const newAccess = json?.data?.accessToken;
      const newRefresh = json?.data?.refreshToken;
      if (newAccess) {
        localStorage.setItem('token', newAccess);
        if (newRefresh) localStorage.setItem('refreshToken', newRefresh);
        return newAccess;
      }
      return null;
    } catch {
      return null;
    }
  };

  /**
   * Returns the best available bearer token.
   * - If token exists and is not near expiry: return it immediately.
   * - If token is expired/near-expiry: try a silent refresh, fall back to original.
   * - If no token: try refresh, fall back to null.
   * NEVER throws. The 401-retry in handleSend handles true auth failures.
   */
  const getValidToken = async () => {
    const token = localStorage.getItem('token');

    if (token) {
      const expiresAt = decodeJwtExpiry(token);
      const bufferMs = 60 * 1000; // proactive refresh 60s before expiry

      if (expiresAt !== null && Date.now() >= expiresAt - bufferMs) {
        // Token is confirmed near/past expiry — try silent refresh
        const refreshed = await tryRefresh();
        // On failure, still return the original token — server decides
        return refreshed || token;
      }
      // Token looks valid (or undecoded — let server decide)
      return token;
    }

    // No token stored at all — try refresh as last resort
    const refreshed = await tryRefresh();
    return refreshed; // may be null — callers must handle null
  };

  const handleClearChat = async () => {
    try {
      const baseURL = getBaseURL();
      const token = await getValidToken();
      
      await fetch(`${baseURL}/v1/chatbot/history`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      setMessages([
        {
          sender: 'bot',
          text: "Conversation cleared. How can I help you?",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (e) {
      console.error("Failed to clear chat history", e);
    }
  };

  const handleSend = async (textToSend) => {
    const queryText = textToSend || input;
    if (!queryText.trim()) return;

    triggerHaptic();

    const userMsg = {
      sender: 'user',
      text: queryText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Internal helper to execute the streaming fetch with a given token.
    // Returns the Response object or throws.
    const doFetch = async (token) => {
      const baseURL = getBaseURL();
      const response = await fetch(`${baseURL}/v1/chatbot/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ query: queryText })
      });
      return response;
    };

    try {
      // Proactively get a valid (possibly refreshed) token before sending
      let token = await getValidToken();
      let response = await doFetch(token);

      // If we still get 401, force a refresh and retry exactly once
      if (response.status === 401) {
        localStorage.removeItem('token'); // force the refresh path
        const refreshed = await tryRefresh();
        if (refreshed) {
          response = await doFetch(refreshed);
        }
        // If still 401 after refresh attempt, fail gracefully and dispatch logout
        if (response.status === 401) {
          window.dispatchEvent(new Event('unauthorized'));
          throw new Error('NO_SESSION');
        }
      }

      if (!response.ok) {
        if (response.status === 429) throw new Error('Too Many Requests');
        throw new Error('Network failure');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: "",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      
      let done = false;
      let firstChunk = true;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          if (firstChunk) {
            playPopSound();
            firstChunk = false;
          }

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (let line of lines) {
            if (line.startsWith('data:')) {
              const data = line.replace('data:', '').trim();
              if (!data) continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    lastMsg.text += parsed.text;
                    return newMessages;
                  });
                }
              } catch (e) {
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMsg = newMessages[newMessages.length - 1];
                  lastMsg.text += data;
                  return newMessages;
                });
              }
            }
          }
        }
      }
    } catch (error) {
      let errorText = "I'm having trouble reaching the assistant right now. Please try again in a moment.";
      if (error.message === 'NO_SESSION') {
        errorText = "Your session could not be refreshed automatically. Please save your work and sign in again.";
      } else if (error.message === 'Too Many Requests') {
        errorText = "You're sending messages too quickly. Please wait a moment and try again.";
      } else if (error.message === 'Network failure') {
        errorText = "Network error. Please check your connection and try again.";
      }
      
      const errorMsg = {
        sender: 'bot',
        text: errorText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => {
        if (prev[prev.length - 1].sender === 'bot' && prev[prev.length - 1].text === '') {
          const updated = [...prev];
          updated[updated.length - 1] = errorMsg;
          return updated;
        }
        return [...prev, errorMsg];
      });
    } finally {
      setLoading(false);
      triggerHaptic();
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Mock data for the pie chart token
  const chartData = [
    { name: 'Transport', value: 400, color: '#10b981' },
    { name: 'Diet', value: 300, color: '#f59e0b' },
    { name: 'Energy', value: 200, color: '#3b82f6' },
    { name: 'Goods', value: 100, color: '#6366f1' }
  ];

  const renderMessageContent = (text) => {
    const tokens = [
      { key: '[ACTION:LOG_ACTIVITY]', type: 'action', label: 'Log an Activity', icon: <Activity className="w-4 h-4" />, path: '/log-activity' },
      { key: '[ACTION:SET_GOAL]', type: 'action', label: 'Set a Goal', icon: <Target className="w-4 h-4" />, path: '/goals' },
      { key: '[ACTION:VIEW_LEADERBOARD]', type: 'action', label: 'View Leaderboard', icon: <Trophy className="w-4 h-4" />, path: '/leaderboard' },
      { key: '[ACTION:DOWNLOAD_PDF]', type: 'pdf', label: 'Download PDF Report', icon: <Download className="w-4 h-4" /> },
      { key: '[CHART:FOOTPRINT_BREAKDOWN]', type: 'chart' }
    ];

    let segments = [{ type: 'text', content: text }];

    tokens.forEach(token => {
      let newSegments = [];
      segments.forEach(segment => {
        if (segment.type === 'text' && segment.content.includes(token.key)) {
          const parts = segment.content.split(token.key);
          parts.forEach((part, index) => {
            if (part) newSegments.push({ type: 'text', content: part });
            if (index < parts.length - 1) {
              newSegments.push({ type: token.type, token });
            }
          });
        } else {
          newSegments.push(segment);
        }
      });
      segments = newSegments;
    });

    return (
      <div className="space-y-3">
        {segments.map((segment, idx) => {
          if (segment.type === 'text') {
            return (
              <ReactMarkdown key={idx} remarkPlugins={[remarkGfm]}>
                {segment.content}
              </ReactMarkdown>
            );
          } else if (segment.type === 'action') {
            return (
              <button
                key={idx}
                onClick={() => {
                  setIsOpen(false);
                  navigate(segment.token.path);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg font-medium transition-colors shadow-sm w-full sm:w-auto justify-center sm:justify-start"
              >
                {segment.token.icon}
                {segment.token.label}
              </button>
            );
          } else if (segment.type === 'pdf') {
            return (
              <button
                key={idx}
                onClick={() => generateCarbonReport()}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors shadow-sm w-full sm:w-auto justify-center sm:justify-start"
              >
                {segment.token.icon}
                {segment.token.label}
              </button>
            );
          } else if (segment.type === 'chart') {
            return (
              <div key={idx} className="w-full h-48 bg-white/50 rounded-xl p-2 mt-2">
                <div className="text-xs font-bold text-center text-slate-500 mb-2 flex items-center justify-center gap-1">
                   <PieChartIcon className="w-3.5 h-3.5" />
                   Recent Breakdown
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} innerRadius={30} outerRadius={50} paddingAngle={5} dataKey="value">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

  return (
    <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 font-sans w-full sm:w-auto h-full sm:h-auto pointer-events-none" aria-label="Chatbot Widget">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
          className="absolute bottom-6 right-6 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all duration-300 group pointer-events-auto"
        >
          <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
        </button>
      )}

      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div 
          role="dialog" 
          aria-label="Chat window"
          className="w-full h-full sm:w-[420px] sm:h-[600px] bg-white/95 backdrop-blur-xl sm:rounded-2xl border-0 sm:border border-slate-200/80 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300 pointer-events-auto"
        >
          
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight text-white">Platform Assistant</h4>
                <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block"></span>
                  Domain Expert
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                aria-label="Clear conversation"
                title="Clear conversation"
                className="text-slate-400 hover:text-emerald-400 transition-colors p-2 rounded-md hover:bg-white/10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="text-slate-400 hover:text-white transition-colors p-2 rounded-md hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-50/50 scroll-smooth" role="log" aria-live="polite">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-slate-100 border-slate-200 text-slate-600' 
                    : 'bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-600 text-white'
                }`}>
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`max-w-[80%] space-y-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block rounded-2xl px-4 py-2.5 text-[15px] shadow-sm leading-relaxed overflow-hidden ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-none text-left'
                      : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none prose prose-sm prose-emerald max-w-none'
                  }`}>
                    {msg.sender === 'bot' ? (
                      renderMessageContent(msg.text)
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium px-1">
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-none px-4 py-3.5 shadow-sm">
                  <div className="flex gap-1.5 items-center justify-center h-2">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-4 py-3 border-t border-slate-100 flex gap-2 overflow-x-auto bg-white/80 backdrop-blur-sm shrink-0 scrollbar-none shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.02)]">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                disabled={loading}
                className="whitespace-nowrap bg-white hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-200 text-slate-600 hover:text-emerald-700 text-[13px] px-3.5 py-1.5 rounded-full font-medium transition-all duration-200 flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HelpCircle className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                {chip}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-200 bg-white flex flex-col gap-2 shrink-0">
            <div className="flex items-end gap-2">
              <button
                onClick={toggleListen}
                title={recognition ? "Click to speak" : "Speech recognition not supported"}
                disabled={!recognition || loading}
                className={`w-11 h-[46px] rounded-xl flex items-center justify-center shadow-sm shrink-0 transition-all duration-200 ${
                  isListening 
                    ? 'bg-red-50 text-red-500 border border-red-200 animate-pulse' 
                    : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-700'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={isListening ? "Listening..." : "Ask about footprint, goals..."}
                disabled={loading}
                aria-label="Type your message"
                rows={1}
                className="flex-1 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-xl px-4 py-3 text-[15px] outline-none transition-all duration-200 resize-none min-h-[46px] max-h-[120px]"
                style={{ height: 'auto' }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
              />
              
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="w-11 h-[46px] rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-200 disabled:to-slate-200 text-white disabled:text-slate-400 flex items-center justify-center shadow-md hover:shadow-emerald-500/20 active:scale-95 transition-all duration-200 shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-[10px] text-center text-slate-400 mt-1 flex items-center justify-center gap-1 leading-tight">
              <span>This assistant uses your authorized Carbon Footprint Platform data. It cannot access unrelated users' information.</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
