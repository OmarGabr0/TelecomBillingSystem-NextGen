import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
  required?: boolean;
}

export default function Select({
  label,
  error,
  icon,
  helperText,
  required,
  className,
  children,
  ...props
}: SelectProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-300">
          {label}
          {required && <span className="text-accent-rose ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">{icon}</div>}
        <select
          className={`w-full glass-card bg-white/[0.02] px-4 py-2.5 ${icon ? 'pl-10' : ''} pr-10 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all ${
            error ? 'border-accent-rose/50' : ''
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
      {error && <p className="text-sm text-accent-rose">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-400">{helperText}</p>}
    </div>
  );
}
