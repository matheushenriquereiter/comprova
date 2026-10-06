import type { InputHTMLAttributes } from 'react';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  name: string;
}

export function AuthInput({ label, error, name, className = '', ...props }: AuthInputProps) {
  return (
    <div className="flex flex-col gap-1.5 font-sans">
      <label htmlFor={name} className="text-[#5f6368] text-xs font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          className={`
            w-full bg-transparent border rounded-[4px] px-3.5 py-3 text-[#202124] text-sm outline-none transition-colors
            ${error 
              ? 'border-[#d93025] focus:border-[#d93025] focus:ring-1 focus:ring-[#d93025]' 
              : 'border-[#dadce0] hover:border-[#80868b] focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]'
            }
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <span className="text-[#d93025] text-xs mt-0.5 flex items-center gap-1">
          <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" className="w-4 h-4">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
}
