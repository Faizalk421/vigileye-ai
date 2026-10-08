import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Eye, ShieldCheck, Cpu, Lock } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Simple Header */}
      <header className="px-6 py-5 border-b border-slate-900 bg-slate-950/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20">
              <Eye className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-lg font-black tracking-tight text-white">
              VigilEye <span className="text-cyan-400 font-light">AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">100% Client-Side Vision Privacy</span>
          </div>
        </div>
      </header>

      {/* Main Form Center Box */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="py-4 px-6 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>© 2026 VigilEye AI • Edge-computed Neural Vision Safety Platform</p>
      </footer>
    </div>
  );
}
