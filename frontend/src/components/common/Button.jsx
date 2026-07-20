import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500',
    outline: 'border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 focus:ring-emerald-500',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const selectedVariant = variants[variant] || variants.primary;
  const selectedSize = sizes.md; // Default size

  return (
    <button 
      className={`${baseStyles} ${selectedVariant} ${selectedSize} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
