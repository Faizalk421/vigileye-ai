import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { sessionService } from '../services/sessionService';
import { useNotification } from '../context/NotificationContext';
import {
  ArrowLeft,
  Clock,
  Eye,
  AlertTriangle,
  Activity,
  Trash2,
  Calendar,
  Laptop,
  CheckCircle2,
  BellRing
} from 'lucide-react';

export default function SessionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotification();

  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await sessionService.getSessionById(id);
        if (res.success && res.data) {
          setSession(res.data);
        }
      } catch (err) {
        showToast('Session not found', 'error');
        navigate('/history');
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this session record?')) return;
    try {
      await sessionService.deleteSession(id);
      showToast('Session deleted', 'success');
      navigate('/history');
    } catch (err) {
      showToast('Failed to delete', 'error');
    }
  };

  const formatSeconds = (sec) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${s}s`;
    return `${mins}m ${s}s`;
  };

  if (loading || !session) {
    return (
      <div className="py-20 text-center text-slate-500">
        <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Loading telemetry records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-900">
        <div className="flex items-center gap-3">
          <Link
            to="/history"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-white">Monitoring Session Details</h1>
            <p className="text-xs text-slate-400 font-mono">ID: {session.id}</p>
          </div>
        </div>

        <button
          onClick={handleDelete}
          className="px-4 py-2 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red-900/40 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Session</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Duration</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xl font-bold text-white font-mono">{formatSeconds(session.durationSeconds)}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Blinks Recorded</span>
            <Eye className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-xl font-bold text-white font-mono">{session.blinkCount}</p>
          <p className="text-[10px] text-slate-500">{session.averageBlinkRate} blinks/min</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Drowsiness Alarms</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-xl font-bold text-rose-400 font-mono">{session.drowsinessCount}</p>
          <p className="text-[10px] text-slate-500">Max closure: {session.longestClosureSeconds}s</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Average EAR Metric</span>
            <Activity className="w-4 h-4 text-violet-400" />
          </div>
          <p className="text-xl font-bold text-cyan-300 font-mono">{session.avgEAR}</p>
          <p className="text-[10px] text-slate-500">Min EAR: {session.minEAR}</p>
        </div>
      </div>

      {/* Session Metadata & Device Card */}
      <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 text-xs space-y-3">
        <h3 className="text-sm font-bold text-white">Session Telemetry Context</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-400">
          <div>
            <span className="block text-[11px] text-slate-500">Start Timestamp</span>
            <span className="text-slate-200 font-medium">{new Date(session.startTime).toLocaleString()}</span>
          </div>
          <div>
            <span className="block text-[11px] text-slate-500">Capture Camera Hardware</span>
            <span className="text-slate-200 font-medium">{session.deviceName || 'Webcam'}</span>
          </div>
          <div>
            <span className="block text-[11px] text-slate-500">Browser Environment</span>
            <span className="text-slate-200 font-medium">{session.browser || 'Web Browser'}</span>
          </div>
        </div>
      </div>

      {/* Drowsiness Event Timeline */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <BellRing className="w-4 h-4 text-rose-400" />
          <span>Fatigue & Drowsiness Event Timeline</span>
        </h3>

        {session.drowsinessEvents?.length === 0 ? (
          <div className="py-6 text-center text-xs text-emerald-400 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Zero drowsiness alarm triggers occurred in this session.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {session.drowsinessEvents?.map((evt, idx) => (
              <div
                key={evt.id || idx}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px]">
                      Alert #{idx + 1}
                    </span>
                    <span className="font-semibold text-white">
                      Eye closure exceeded {evt.durationSeconds}s
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Trigger EAR: {evt.earAtTrigger} • Auto-Reset Tone Synthesized
                  </p>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
