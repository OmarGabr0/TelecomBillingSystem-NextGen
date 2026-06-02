import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  showCharCount?: boolean;
  maxCharacters?: number;
}

export default function Textarea({
  label,
  error,
  helperText,
  required,
  showCharCount,
  maxCharacters,
  className,
  value,
  onChange,
  ...props
}: TextareaProps) {
  const charCount = typeof value === 'string' ? value.length : 0;
  const isFull = maxCharacters && charCount >= maxCharacters;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-300">
          {label}
          {required && <span className="text-accent-rose ml-1">*</span>}
        </label>
      )}
      <textarea
        className={`w-full glass-card bg-white/[0.02] px-4 py-2.5 text-white rounded-lg border border-white/[0.08] focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-transparent transition-all resize-none ${
          error ? 'border-accent-rose/50 focus:ring-accent-rose/50' : ''
        } ${isFull ? 'border-accent-rose/50' : ''} ${className}`}
        value={value}
        onChange={onChange}
        maxLength={maxCharacters}
        {...props}
      />
      <div className="flex justify-between items-center">
        <div>
          {error && <p className="text-sm text-accent-rose">{error}</p>}
          {helperText && !error && <p className="text-xs text-slate-400">{helperText}</p>}
        </div>
        {showCharCount && maxCharacters && (
          <p className={`text-xs ${isFull ? 'text-accent-rose' : 'text-slate-400'}`}>
            {charCount}/{maxCharacters}
          </p>
        )}
      </div>
    </div>
  );
}
