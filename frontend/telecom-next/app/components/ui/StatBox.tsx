'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Card from './Card';
import { LucideIcon } from 'lucide-react';

interface StatBoxProps {
  label: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  gradient?: 'blue' | 'violet' | 'emerald' | 'amber';
  delay?: number;
}

const gradientClasses = {
  blue: 'from-accent-blue/20 to-accent-cyan/10',
  violet: 'from-accent-violet/20 to-accent-blue/10',
  emerald: 'from-accent-emerald/20 to-accent-cyan/10',
  amber: 'from-accent-amber/20 to-accent-rose/10',
};

const iconBgClasses = {
  blue: 'bg-accent-blue/20 text-accent-blue',
  violet: 'bg-accent-violet/20 text-accent-violet',
  emerald: 'bg-accent-emerald/20 text-accent-emerald',
  amber: 'bg-accent-amber/20 text-accent-amber',
};

export default function StatBox({
  label,
  value,
  change,
  icon: Icon,
  gradient = 'blue',
  delay = 0,
}: StatBoxProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card gradient={gradient} className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-slate-400 text-sm font-medium mb-2">{label}</p>
            <p className="text-3xl font-bold text-white mono-stat mb-3">{value}</p>
            
            {change !== undefined && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.2 }}
                className={`text-xs font-medium ${
                  change >= 0 ? 'text-accent-emerald' : 'text-accent-rose'
                }`}
              >
                {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% from last month
              </motion.div>
            )}
          </div>
          
          <motion.div
            whileHover={{ scale: 1.1, rotate: 10 }}
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              iconBgClasses[gradient]
            }`}
          >
            <Icon size={24} />
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}
