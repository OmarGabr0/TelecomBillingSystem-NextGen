'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

type Tab = 'overview' | 'customers' | 'profiles' | 'contracts' | 'analytics';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  activeTab?: Tab;
  onTabChange?: (tab: Tab) => void;
  onLogout?: () => void;
  userInfo?: {
    name: string;
    role: string;
  };
}

export default function DashboardLayout({
  children,
  title = 'Dashboard',
  activeTab,
  onTabChange,
  onLogout,
  userInfo,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-surface-950 overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} onLogout={onLogout} />

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex-1 flex flex-col overflow-hidden"
      >
        {/* Navbar */}
        <Navbar title={title} userInfo={userInfo} />

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex-1 overflow-y-auto bg-gradient-to-b from-surface-950 via-surface-950 to-surface-900"
        >
          {/* Animated background grid */}
          <div className="fixed inset-0 bg-grid-subtle pointer-events-none" />
          
          {/* Floating blur backgrounds */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                x: [0, 50, 0],
                y: [0, 50, 0],
              }}
              transition={{ duration: 20, repeat: Infinity }}
              className="absolute top-20 left-1/4 w-72 h-72 bg-accent-blue/20 rounded-full blur-3xl opacity-20"
            />
            <motion.div
              animate={{
                x: [0, -50, 0],
                y: [0, -50, 0],
              }}
              transition={{ duration: 25, repeat: Infinity }}
              className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent-violet/20 rounded-full blur-3xl opacity-20"
            />
          </div>

          {/* Actual content */}
          <div className="relative z-10">
            {children}
          </div>
        </motion.div>
      </motion.main>
    </div>
  );
}