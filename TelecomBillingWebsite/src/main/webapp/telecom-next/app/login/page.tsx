"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      // Check role returned from native com.iti.model.User object
      if (data.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/user");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-surface-950 bg-grid-subtle overflow-hidden px-4">
      {/* Dynamic Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-blue/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md p-8 glass-card animate-fade-up">
        {/* Header Block */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-accent-blue/10 border border-accent-blue/20 mb-4">
            <svg className="w-6 h-6 text-accent-blue animate-pulse-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">TelecoSmart</h1>
          <p className="text-sm text-slate-400">Enterprise Billing & Mediation Management</p>
        </div>

        {/* Input Forms */}
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-3 text-xs font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg animate-fade-up">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">System Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., admin_medhat"
              className="w-full px-4 py-2.5 bg-surface-900 border border-surface-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Security Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-surface-900 border border-surface-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-accent-blue hover:bg-blue-600 disabled:bg-accent-blue/50 text-white font-medium text-sm rounded-xl shadow-glow transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Sign In to Platform"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}