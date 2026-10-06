import type { ButtonHTMLAttributes } from 'react';

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

export function AuthButton({ children, variant = 'primary', isLoading, className = '', ...props }: AuthButtonProps) {
  const baseClasses = "font-sans text-sm font-medium rounded-[4px] px-6 py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a73e8]";
  
  const colors = {
    primary: "bg-[#1a73e8] text-white hover:bg-[#1b66c9] shadow-sm hover:shadow",
    secondary: "bg-transparent text-[#1a73e8] hover:bg-[#f8f9fa]"
  };

  return (
    <button 
      className={`${baseClasses} ${colors[variant]} ${isLoading || props.disabled ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      <span className="flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Carregando...
          </>
        ) : (
          children
        )}
      </span>
    </button>
  );
}
