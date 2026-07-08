import { forwardRef } from 'react';

export const Button = forwardRef(({ 
  className = '', 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  children, 
  disabled, 
  type = 'button',
  ...props 
}, ref) => {
  // scale-[0.98] provides the tactile feedback
  const baseStyles = "relative inline-flex items-center justify-center rounded-md font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-60 disabled:pointer-events-none active:scale-[0.98] overflow-hidden";
  
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-500 shadow-sm hover:shadow focus-visible:ring-primary-600",
    secondary: "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus-visible:ring-gray-500",
    outline: "border-2 border-primary-600 bg-transparent text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-600",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-900 focus-visible:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-500 shadow-sm hover:shadow focus-visible:ring-red-600",
  };

  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6 text-[15px]",
    lg: "h-12 px-8 text-base",
  };

  return (
    <button
      ref={ref}
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      <div className={`transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} flex items-center justify-center w-full h-full`}>
        {children}
      </div>
      
      {/* Absolute positioned spinner that fades in without shifting layout */}
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isLoading ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}>
        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    </button>
  );
});

Button.displayName = 'Button';
