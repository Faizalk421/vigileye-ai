/**
 * Dashboard Component
 * Displays real-time drowsiness progress gauge, blink statistics, session uptime,
 * and detection analytics.
 */

import React from 'react';
import { Gauge, Zap, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

export default function Dashboard({
  detectionState,
  stats,
  drowsinessThreshold,
  isCameraActive
}) {
  const { isDrowsy, overallClosed, closedDuration, drowsinessProgress } = detectionState;
  const { blinkCount, drowsinessEventsCount, sessionUptimeSeconds } = stats;

  // Format uptime
  const formatUptime = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Blinks per minute calculation
  const blinksPerMin = sessionUptimeSeconds > 10
    ? ((blinkCount / sessionUptimeSeconds) * 60).toFixed(1)
    : '--';

  // Determine Drowsiness State Badge & Color
  let stateTitle = 'NORMAL STATE';
  let stateColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  let progressBg = 'bg-emerald-500';

  if (!isCameraActive) {
    stateTitle = 'MONITORING STANDBY';
    stateColor = 'text-slate-400 border-slate-700 bg-slate-800/40';
  } else if (isDrowsy) {
    stateTitle = '⚠️ DROWSINESS DETECTED!';
    stateColor = 'text-red-400 border-red-500/50 bg-red-500/20 animate-pulse';
    progressBg = 'bg-red-500';
  } else if (overallClosed && closedDuration > 0.4) {
    stateTitle = 'EYE CLOSURE DETECTED';
    stateColor = 'text-amber-400 border-amber-500/40 bg-amber-500/15';
    progressBg = 'bg-amber-400';
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 md:p-5 shadow-2xl backdrop-blur-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Drowsiness Monitor</h3>
            <p className="text-xs text-slate-400">Continuous eye closure tracking</p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${stateColor}`}>
          {stateTitle}
        </span>
      </div>

      {/* Real-time Closure Gauge Bar */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Eye Closure Duration:</span>
          <span className="font-mono font-bold text-sm text-white">
            {closedDuration.toFixed(2)}s <span className="text-slate-500 font-normal">/ {drowsinessThreshold.toFixed(1)}s max</span>
          </span>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden p-0.5 relative">
          <div
            className={`h-full rounded-full transition-all duration-100 ${progressBg}`}
            style={{ width: `${Math.min(100, drowsinessProgress * 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>0.0s (Normal Blink)</span>
          <span>{ (drowsinessThreshold * 0.5).toFixed(1) }s (Warning)</span>
          <span className="text-red-400 font-semibold">{drowsinessThreshold.toFixed(1)}s (Alarm Trigger)</span>
        </div>
      </div>

      {/* 4-Stat Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Blinks Count */}
        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Total Blinks</span>
          </div>
          <span className="text-lg font-mono font-bold text-white">{blinkCount}</span>
        </div>

        {/* Blink Rate */}
        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            <span>Blinks/Min</span>
          </div>
          <span className="text-lg font-mono font-bold text-white">{blinksPerMin}</span>
        </div>

        {/* Drowsiness Episodes */}
        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Drowsy Events</span>
          </div>
          <span className={`text-lg font-mono font-bold ${
            drowsinessEventsCount > 0 ? 'text-amber-400' : 'text-slate-300'
          }`}>
            {drowsinessEventsCount}
          </span>
        </div>

        {/* Session Time */}
        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Uptime</span>
          </div>
          <span className="text-lg font-mono font-bold text-white">{formatUptime(sessionUptimeSeconds)}</span>
        </div>
      </div>
    </div>
  );
}
