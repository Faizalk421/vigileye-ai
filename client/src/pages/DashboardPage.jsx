import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsService } from '../services/analyticsService';
import BlinkRateChart from '../charts/BlinkRateChart';
import DrowsinessChart from '../charts/DrowsinessChart';
import {
  Clock,
  Eye,
  Activity,
  AlertTriangle,
  Play,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Calendar,
  ArrowRight,
  Zap
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [charts, setCharts] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [overviewRes, chartsRes] = await Promise.all([
          analyticsService.getOverview(),
          analyticsService.getCharts('7d')
        ]);
        if (overviewRes.success) setOverview(overviewRes.data);
        if (chartsRes.success) setCharts(chartsRes.data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const today = overview?.today || {
    sessionCount: 0,
    monitoringTimeSeconds: 0,
    blinkCount: 0,
    averageBlinkRate: 0,
    drowsinessCount: 0,
    longestClosureSeconds: 0,
    avgEAR: 0.28
  };

  const formatSeconds = (sec) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-900 rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-900 rounded-2xl" />)}
        </div>
        <div className="h-80 bg-slate-900 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              VigilEye AI Engine v2.0
            </span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Safety System Online
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {getGreeting()}, {user?.fullName?.split(' ')[0] || 'Driver'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
            Real-time biometric computer vision monitoring is calibrated and ready.
          </p>
        </div>

        {/* Quick Launch Button */}
        <Link
          to="/monitor"
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs sm:text-sm hover:brightness-110 shadow-xl shadow-cyan-500/20 transition-all flex items-center gap-2.5 shrink-0 group"
        >
          <Play className="w-4 h-4 fill-slate-950 group-hover:scale-110 transition-transform" />
          <span>Launch Live Monitor</span>
        </Link>
      </div>

      {/* Today's Safety Overview Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>Today's Safety Overview</span>
          </h2>
          <span className="text-xs text-slate-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Card 1: Monitoring Time */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Monitoring Time</span>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">
              {formatSeconds(today.monitoringTimeSeconds)}
            </p>
            <p className="text-[10px] text-slate-500">{today.sessionCount} session(s) today</p>
          </div>

          {/* Card 2: Blinks */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Total Blinks</span>
              <Eye className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">
              {today.blinkCount.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-500">Natural hydration</p>
          </div>

          {/* Card 3: Blink Rate */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Blink Rate</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">
              {today.averageBlinkRate} <span className="text-xs font-normal text-slate-400">/min</span>
            </p>
            <p className="text-[10px] text-emerald-400">Normal Range (15-20)</p>
          </div>

          {/* Card 4: Drowsiness Events */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Drowsiness Events</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-amber-400">
              {today.drowsinessCount}
            </p>
            <p className="text-[10px] text-slate-500">Alarms triggered & reset</p>
          </div>

          {/* Card 5: Longest Closure */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Longest Closure</span>
              <Clock className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">
              {today.longestClosureSeconds} <span className="text-xs font-normal text-slate-400">sec</span>
            </p>
            <p className="text-[10px] text-slate-500">Peak eye closure delay</p>
          </div>

          {/* Card 6: Average EAR */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Average EAR</span>
              <Activity className="w-4 h-4 text-violet-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">
              {today.avgEAR}
            </p>
            <p className="text-[10px] text-slate-500">Baseline aperture</p>
          </div>
        </div>
      </section>

      {/* 2-Column Analytics Preview & Smart Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 7-Day Blink & Drowsiness Trends (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">7-Day Blink Rate Trend</h3>
                <p className="text-xs text-slate-400">Blinks per minute across monitoring days</p>
              </div>
              <Link to="/analytics" className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1">
                <span>View Full Analytics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <BlinkRateChart data={charts?.chartData || []} />
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Fatigue & Drowsiness Incidents</h3>
              <p className="text-xs text-slate-400">Alarm trigger events by date</p>
            </div>
            <DrowsinessChart data={charts?.chartData || []} />
          </div>
        </div>

        {/* Right: Smart Telemetry Insights (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Smart Telemetry Insights</h3>
            </div>
            <p className="text-xs text-slate-400">
              Algorithmic observations derived from your historical eye closure patterns.
            </p>

            <div className="space-y-3 pt-1">
              {(overview?.insights || []).map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border text-xs space-y-1.5 transition-all ${
                    item.level === 'warning'
                      ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                      : item.level === 'success'
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                      {item.type}
                    </span>
                    <span className="text-[10px] text-slate-500">Automated</span>
                  </div>
                  <h4 className="font-bold text-white text-xs">{item.title}</h4>
                  <p className="text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy & Edge Processing Badge Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-950/20 to-slate-900 border border-cyan-500/20 space-y-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <h4 className="text-sm font-bold text-white">Client-Side Neural Protection</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your video stream is processed on your device's web worker with MediaPipe WASM. Only aggregated statistics are saved.
            </p>
            <Link
              to="/privacy-center"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:underline"
            >
              <span>Explore Privacy Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
