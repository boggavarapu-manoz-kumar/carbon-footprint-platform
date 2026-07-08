import { Outlet } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side - Login Form Area */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-[480px] xl:w-[560px]">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <Outlet />
        </div>
      </div>

      {/* Right Side - Decorative/Branding Area (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-1 relative bg-slate-900 justify-center items-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Subtle gradient overlay to convey premium feel */}
          <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-slate-800/20 to-slate-900/90" />
          {/* Faint geometric pattern */}
          <svg className="absolute inset-0 h-full w-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 40V0H40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center text-white px-12 text-center">
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm mb-8 ring-1 ring-white/20 shadow-2xl">
            <ShieldCheck className="w-16 h-16 text-primary-400" />
          </div>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Enterprise Security
          </h2>
          <p className="mt-4 text-lg text-slate-300 max-w-md font-light leading-relaxed">
            Carbon Footprint Platform Administration. Fully isolated, zero-trust backend access.
          </p>
        </div>
      </div>
    </div>
  );
};
