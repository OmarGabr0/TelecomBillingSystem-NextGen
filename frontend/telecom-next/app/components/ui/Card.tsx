import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradient?: 'blue' | 'violet' | 'emerald' | 'none';
  hover?: boolean;
}

export default function Card({
  gradient = 'none',
  hover = true,
  className,
  children,
  ...props
}: CardProps) {
  const gradients = {
    blue: 'bg-gradient-to-br from-accent-blue/10 to-accent-cyan/5',
    violet: 'bg-gradient-to-br from-accent-violet/10 to-accent-blue/5',
    emerald: 'bg-gradient-to-br from-accent-emerald/10 to-accent-cyan/5',
    none: '',
  };
  
  return (
    <div
      className={`glass-card ${gradient ? gradients[gradient] : ''} ${hover ? 'hover:shadow-card-hover hover:border-white/20' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
