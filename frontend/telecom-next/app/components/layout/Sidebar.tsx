'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, BarChart3, Users, FileText, Zap, Settings, LogOut, Home } from 'lucide-react';

type Tab = 'overview' | 'customers' | 'profiles' | 'contracts' | 'analytics';

interface SidebarProps {
  activeTab?: Tab;
  onTabChange?: (tab: Tab) => void;
  onLogout?: () => void;
}

const navItems = [
  { id: 'overview' as const, label: 'Overview', icon: Home },
  { id: 'customers' as const, label: 'Customers', icon: Users },
  { id: 'profiles' as const, label: 'Rate Plans', icon: Zap },
  { id: 'contracts' as const, label: 'Contracts', icon: FileText },
  { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
];

export default function Sidebar({ activeTab = 'overview', onTabChange, onLogout }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  const handleLogoutClick = () => {
    onLogout?.();
    setIsOpen(false);
  };

  React.useEffect(() => {
    setIsMounted(true);
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // During SSR and initial client render, render as desktop to match server output
  const showSidebar = isMounted ? (isOpen || isDesktop) : true;

  const sidebarVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    exit: {
      x: -300,
      opacity: 0,
      transition: { duration: 0.2, ease: 'easeIn' },
    },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: { delay: i * 0.05, duration: 0.3 },
    }),
  };

  const handleTabClick = (tabId: Tab) => {
    onTabChange?.(tabId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg glass-card md:hidden"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </motion.button>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {showSidebar && (
          <>
            {/* Overlay */}
            {isOpen && (
              <motion.div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
                onClick={() => setIsOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}

            {/* Sidebar Content */}
            <motion.aside
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 left-0 w-64 h-screen glass-card rounded-none border-r border-white/10 z-40 flex flex-col p-6 overflow-y-auto md:relative md:top-auto md:left-auto md:z-0 md:rounded-none"
            >
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 pb-6 border-b border-white/10"
              >
                <h1 className="text-2xl font-bold gradient-text">TelecoSmart</h1>
                <p className="text-xs text-slate-400 mt-1">Billing Platform</p>
              </motion.div>

              {/* Navigation */}
              <nav className="flex-1 space-y-2">
                {navItems.map((item, i) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <motion.button
                      key={item.id}
                      custom={i}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                        isActive
                          ? 'bg-gradient-blue text-white shadow-glow'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon
                        size={20}
                        className={`transition-transform duration-300 ${
                          isActive ? 'group-hover:rotate-6' : ''
                        }`}
                      />
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <motion.div
                          className="ml-auto w-2 h-2 rounded-full bg-white"
                          layoutId="activeIndicator"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </nav>

              {/* Bottom Actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="pt-6 border-t border-white/10 space-y-2"
              >
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition-all duration-300">
                  <Settings size={20} />
                  <span className="font-medium">Settings</span>
                </button>
                <button onClick={handleLogoutClick} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-accent-rose/20 hover:text-accent-rose transition-all duration-300">
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              </motion.div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
