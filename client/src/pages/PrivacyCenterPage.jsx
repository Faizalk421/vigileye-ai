import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { sessionService } from '../services/sessionService';
import { useNotification } from '../context/NotificationContext';
import {
  Shield,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Download,
  Trash2,
  Lock,
  Cpu,
  Eye,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export default function PrivacyCenterPage() {
  const { user, logout } = useAuth();
  const { showToast } = useNotification();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const res = await authService.exportUserData();
      if (res.success && res.data) {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.data, null, 2));
        const link = document.createElement('a');
        link.setAttribute('href', dataStr);
        link.setAttribute('download', `vigileye_privacy_export_${user?.username || 'user'}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Personal data export package downloaded.', 'success');
      }
    } catch (err) {
      showToast('Export failed', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteHistory = async () => {
    if (!window.confirm('Delete all your session telemetry records?')) return;
    try {
      await sessionService.clearAllSessions();
      showToast('All monitoring telemetry deleted.', 'success');
    } catch (err) {
      showToast('Failed to clear history', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('CRITICAL ACTION: Are you absolutely sure? This will delete your user profile, settings, and all telemetry forever.')) {
      return;
    }
    try {
      await authService.deleteAccount();
      await logout();
      window.location.href = '/register';
    } catch (err) {
      showToast('Failed to delete account', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              Privacy First Architecture
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">VigilEye Privacy Center</h1>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Transparent transparency into how your computer vision telemetry is processed and stored.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 flex items-center gap-3 shrink-0">
          <ShieldCheck className="w-8 h-8 text-emerald-400" />
          <div>
            <p className="text-xs font-bold text-white">Zero Video Cloud Uploads</p>
            <p className="text-[10px] text-emerald-400">100% Client-Side Neural AI</p>
          </div>
        </div>
      </div>

      {/* Privacy Architecture Status Checklist */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>Computer Vision Data Flow Verification</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white">Camera Processing</span>
              <p className="text-[11px] text-slate-400">MediaPipe WASM on CPU/GPU</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Processed Locally</span>
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white">Webcam Video Upload</span>
              <p className="text-[11px] text-slate-400">Raw frames and streams</p>
            </div>
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Disabled</span>
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white">Face Mesh Coordinate Upload</span>
              <p className="text-[11px] text-slate-400">478 landmark raw points</p>
            </div>
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Disabled</span>
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white">Aggregated Session Statistics</span>
              <p className="text-[11px] text-slate-400">Blink count, mean EAR, duration</p>
            </div>
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>User Controlled</span>
            </span>
          </div>
        </div>
      </div>

      {/* User Data Rights & Portability */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5">
        <h3 className="text-sm font-bold text-white">Data Portability & GDPR Controls</h3>

        {/* Export */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div>
            <h4 className="text-xs font-bold text-white">Export Personal Telemetry Archive</h4>
            <p className="text-[11px] text-slate-400">
              Download complete structured JSON archive of your profile, sessions, and fatigue logs.
            </p>
          </div>
          <button
            onClick={handleExportData}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-2 self-start sm:self-auto shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Data (JSON)</span>
          </button>
        </div>

        {/* Clear Telemetry */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div>
            <h4 className="text-xs font-bold text-white">Purge All Session Records</h4>
            <p className="text-[11px] text-slate-400">
              Permanently erase all historical blink counts, EAR analytics, and drowsiness event logs.
            </p>
          </div>
          <button
            onClick={handleDeleteHistory}
            className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-red-400 hover:bg-red-950/30 text-xs font-semibold flex items-center gap-2 self-start sm:self-auto shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete History</span>
          </button>
        </div>

        {/* Delete Account */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-red-950/20 border border-red-500/30">
          <div>
            <h4 className="text-xs font-bold text-red-300">Delete VigilEye Account</h4>
            <p className="text-[11px] text-slate-400">
              Permanently delete user profile, security tokens, and all database records.
            </p>
          </div>
          <button
            onClick={handleDeleteAccount}
            className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-500 shadow-md shadow-red-600/20 self-start sm:self-auto shrink-0"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
