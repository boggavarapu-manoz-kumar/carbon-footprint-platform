import { Outlet } from 'react-router-dom';
import { ShieldCheck, Server, Lock, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';

export const AuthLayout = () => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex bg-[#030712] text-slate-200 overflow-hidden relative font-sans">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-900/20 blur-[120px] mix-blend-screen" />
        <div className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-indigo-900/20 blur-[130px] mix-blend-screen" />
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-slate-800/40 blur-[100px] mix-blend-screen" />
        
        {/* Tech Grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDQwaDQwVjBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMTBoNDBNMTAgMHY0ME0wIDIwaDQwTTIwIDB2NDBNMCAzMGg0ME0zMCAwdjQwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=')] opacity-50" />
      </div>

      <div className="relative z-10 flex w-full max-w-[1400px] mx-auto p-4 sm:p-8">
        {/* Left Side - Login Form Area */}
        <div className="flex-1 flex flex-col justify-center items-center lg:items-start lg:pl-10 xl:pl-20">
          <div className={`w-full max-w-[420px] transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <Outlet />
          </div>
        </div>

        {/* Right Side - Decorative/Branding Area */}
        <div className={`hidden lg:flex flex-1 flex-col justify-center items-center p-12 transition-all duration-1000 delay-300 transform ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
          
          <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
            {/* Glowing Orbs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
            
            {/* Glass Container */}
            <div className="relative z-10 w-full h-full bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 rounded-[3rem] shadow-2xl p-12 flex flex-col items-center justify-center overflow-hidden">
              
              {/* Refraction effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
              
              <div className="relative flex items-center justify-center mb-8">
                <div className="absolute inset-0 bg-blue-500/20 rounded-3xl blur-xl animate-pulse" />
                <div className="w-24 h-24 bg-slate-800/80 backdrop-blur-md border border-slate-600/50 rounded-3xl flex items-center justify-center shadow-inner relative z-10">
                  <ShieldCheck className="w-12 h-12 text-blue-400" strokeWidth={1.5} />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold tracking-tight text-white mb-4 text-center">
                Command Center
              </h2>
              
              <p className="text-slate-400 text-center text-sm leading-relaxed max-w-xs mb-10">
                Secure enterprise administration portal. Zero-trust architecture with complete operational oversight.
              </p>

              {/* Status Indicators */}
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <Server className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-medium text-slate-300">System Status</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                    <span className="text-xs font-bold text-emerald-400">ONLINE</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-medium text-slate-300">Encryption</span>
                  </div>
                  <div className="text-xs font-bold text-blue-400">AES-256</div>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-medium text-slate-300">Active Nodes</span>
                  </div>
                  <div className="text-xs font-bold text-indigo-400">1,204</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
