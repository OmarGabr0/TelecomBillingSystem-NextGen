'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  count?: number;
  className?: string;
  type?: 'text' | 'card' | 'avatar' | 'table-row';
}

const skeletonVariants = {
  loading: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export default function Skeleton({
  count = 1,
  className = '',
  type = 'text',
}: SkeletonProps) {
  const getTypeClass = () => {
    switch (type) {
      case 'card':
        return 'w-full h-40 rounded-lg';
      case 'avatar':
        return 'w-10 h-10 rounded-full';
      case 'table-row':
        return 'w-full h-10 rounded-md';
      default:
        return 'w-full h-4 rounded-md';
    }
  };

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={`skeleton ${getTypeClass()} ${className}`}
          variants={skeletonVariants}
          animate="loading"
        />
      ))}
    </div>
  );
}
