import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center space-y-4">
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 text-cyan-400">
        <Eye className="w-12 h-12 stroke-[2]" />
      </div>
      <h1 className="text-4xl font-black text-white">404 — Page Not Found</h1>
      <p className="text-xs text-slate-400 max-w-sm">
        The requested computer vision interface or telemetry route does not exist.
      </p>
      <Link
        to="/dashboard"
        className="px-5 py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-colors inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
}
