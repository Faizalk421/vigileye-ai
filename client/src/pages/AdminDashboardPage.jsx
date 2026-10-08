import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import {
  ShieldAlert,
  Users,
  Activity,
  Clock,
  AlertTriangle,
  Server,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const res = await adminService.getOverview();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin overview:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  const stats = data?.stats || {
    totalUsers: 0,
    activeUsers: 0,
    verifiedUsers: 0,
    totalSessions: 0,
    totalMonitoringHours: 0,
    totalDrowsinessEvents: 0,
    systemStatus: 'Operational',
    uptime: '99.9%'
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Loading admin telemetry & user data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
            SYSTEM CONTROL CENTER
          </span>
          <h1 className="text-2xl font-black text-white mt-1">Platform Admin Overview</h1>
          <p className="text-xs text-slate-400">
            Real-time platform usage metrics, user accounts, and system health status.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>System {stats.systemStatus} ({stats.uptime})</span>
        </div>
      </div>

      {/* Admin Stat Cards 4x2 Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Users</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.totalUsers}</p>
          <p className="text-[10px] text-emerald-400">{stats.activeUsers} active accounts</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Verified Users</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.verifiedUsers}</p>
          <p className="text-[10px] text-slate-500">Email confirmed</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Sessions</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.totalSessions}</p>
          <p className="text-[10px] text-slate-500">Completed runs</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Monitoring Hours</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{stats.totalMonitoringHours}h</p>
          <p className="text-[10px] text-slate-500">Total computer-vision runtime</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Fatigue Alarms</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400 font-mono">{stats.totalDrowsinessEvents}</p>
          <p className="text-[10px] text-slate-500">Alarms sounded</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Database Backend</span>
            <Server className="w-4 h-4 text-violet-400" />
          </div>
          <p className="text-xl font-bold text-white">Postgres / SQLite</p>
          <p className="text-[10px] text-emerald-400">Prisma ORM Sync</p>
        </div>
      </div>

      {/* 2-Column: Recent Users & Recent Monitoring Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Recent User Registrations</span>
            </h3>
            <Link to="/admin/users" className="text-xs text-amber-400 hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {(data?.recentUsers || []).map((u) => (
              <div
                key={u.id}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{u.fullName}</span>
                    <span className="text-[10px] font-mono text-slate-500">@{u.username}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${u.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                      {u.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{u.email}</p>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(u.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Recent Telemetry Sessions</span>
            </h3>
            <Link to="/admin/analytics" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
              <span>Admin Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {(data?.recentSessions || []).map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-white">{s.user?.fullName || 'User'}</p>
                  <p className="text-[11px] text-slate-400">
                    Duration: {Math.round(s.durationSeconds / 60)}m • Blinks: {s.blinkCount} • Alarms: {s.drowsinessCount}
                  </p>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
