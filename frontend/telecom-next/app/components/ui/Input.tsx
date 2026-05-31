import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  icon,
  className,
  ...props
}: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
        <input
          className={`w-full glass-card bg-white/[0.02] px-4 py-2.5 ${icon ? 'pl-10' : ''} text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all ${
            error ? 'border-accent-rose/50' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-accent-rose">{error}</p>}
    </div>
  );
}
