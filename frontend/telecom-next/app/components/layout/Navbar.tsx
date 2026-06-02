'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, User } from 'lucide-react';

interface NavbarProps {
  title?: string;
  userInfo?: {
    name: string;
    role: string;
  };
}

export default function Navbar({ title = 'Dashboard', userInfo }: NavbarProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-none border-b border-white/10 sticky top-0 z-30"
    >
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left Section */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-sm text-slate-400 mt-1">Welcome back to your dashboard</p>
        </motion.div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="hidden md:flex items-center bg-white/5 rounded-lg px-3 py-2 border border-white/10 hover:border-white/20 transition-all"
          >
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent ml-2 outline-none text-sm text-slate-300 placeholder-slate-500 w-32"
            />
          </motion.div>

          {/* Notification Bell */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Bell size={20} className="text-slate-400 hover:text-white transition-colors" />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1 right-1 w-2 h-2 bg-accent-rose rounded-full"
            />
          </motion.button>

          {/* User Profile */}
          {userInfo && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 pl-3 border-l border-white/10"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-white">{userInfo.name}</p>
                <p className="text-xs text-slate-400">{userInfo.role}</p>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 rounded-lg bg-gradient-violet flex items-center justify-center cursor-pointer"
              >
                <User size={20} className="text-white" />
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
