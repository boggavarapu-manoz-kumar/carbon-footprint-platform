import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Input = forwardRef(({ 
  className = '', 
  error, 
  label, 
  id, 
  type = 'text',
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const isPasswordType = type === 'password';
  const inputType = isPasswordType && showPassword ? 'text' : type;

  return (
    <div className="w-full relative">
      <div 
        className={`
          relative rounded-md border 
          transition-all duration-200 ease-out
          ${error 
            ? 'border-red-500 ring-2 ring-red-500/20' 
            : isFocused 
              ? 'border-primary-500 ring-2 ring-primary-500/20' 
              : 'border-gray-300 hover:border-gray-400'
          }
          bg-white
        `}
      >
        {label && (
          <label 
            htmlFor={id} 
            className={`
              absolute left-3 transition-all duration-200 ease-out pointer-events-none
              ${(isFocused || props.value || props.defaultValue) 
                ? 'top-1.5 text-[11px] font-medium text-gray-500' 
                : 'top-3.5 text-[15px] text-gray-400'
              }
              ${error && (isFocused || props.value || props.defaultValue) ? 'text-red-500' : ''}
              ${isFocused && !error ? 'text-primary-600' : ''}
            `}
          >
            {label}
          </label>
        )}
        
        <input
          id={id}
          ref={ref}
          type={inputType}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${id}-error` : undefined}
          onFocus={(e) => {
            setIsFocused(true);
            if (props.onFocus) props.onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (props.onBlur) props.onBlur(e);
          }}
          className={`
            block w-full bg-transparent border-0
            ${label ? 'pt-6 pb-2 px-3' : 'py-3 px-3'}
            text-gray-900 
            focus:outline-none focus:ring-0
            sm:text-sm sm:leading-6
            disabled:cursor-not-allowed disabled:opacity-50
            ${isPasswordType ? 'pr-10' : ''}
            ${className}
          `}
          placeholder={isFocused ? props.placeholder : ''} // Only show placeholder when focused if floating label exists
          {...props}
        />
        
        {isPasswordType && (
          <button
            type="button"
            className={`
              absolute inset-y-0 right-0 flex items-center pr-3 
              text-gray-400 hover:text-gray-600 focus:outline-none focus:text-primary-600
              transition-colors
            `}
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Eye className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      
      {/* Error Message with strict height to prevent layout shift */}
      <div className="min-h-[20px] mt-1.5" aria-live="polite">
        {error && (
          <p id={`${id}-error`} className="text-sm font-medium text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
            {error}
          </p>
        )}
      </div>
    </div>
  );
});

Input.displayName = 'Input';
