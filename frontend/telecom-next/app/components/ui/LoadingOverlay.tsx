import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export default function LoadingOverlay({ isLoading, message = 'Loading...' }: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="glass-card bg-white/[0.02] p-8 rounded-2xl border border-white/[0.1] space-y-4">
        <Loader2 size={40} className="animate-spin text-accent-blue mx-auto" />
        <p className="text-center text-slate-200">{message}</p>
      </div>
    </div>
  );
}
