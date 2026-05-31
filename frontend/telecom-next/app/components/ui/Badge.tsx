import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export default function Badge({
  variant = 'primary',
  className,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    primary: 'bg-accent-blue/20 text-accent-blue border border-accent-blue/30',
    success: 'bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/30',
    warning: 'bg-accent-amber/20 text-accent-amber border border-accent-amber/30',
    danger: 'bg-accent-rose/20 text-accent-rose border border-accent-rose/30',
    info: 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30',
  };
  
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
