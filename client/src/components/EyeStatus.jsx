/**
 * EyeStatus Component
 * Displays real-time metrics for Left Eye, Right Eye, EAR meters, and Overall Status.
 */

import React from 'react';
import { Eye, EyeOff, Activity } from 'lucide-react';

export default function EyeStatus({ detectionState, earThreshold }) {
  const { faceDetected, leftEye, rightEye, overallClosed, avgEAR } = detectionState;

  // Render an individual eye metric card
  const renderEyeCard = (name, eyeData) => {
    const isClosed = eyeData.isClosed;
    const earVal = eyeData.ear || 0;
    // Calculate percentage for progress meter (0.0 to 0.40 scaled to 0-100%)
    const meterPercent = Math.min(100, Math.max(0, (earVal / 0.4) * 100));
    const thresholdPercent = Math.min(100, Math.max(0, (earThreshold / 0.4) * 100));

    return (
      <div className={`p-4 rounded-xl border transition-all duration-300 ${
        !faceDetected
          ? 'bg-slate-900/60 border-slate-800 opacity-60'
          : isClosed
          ? 'bg-red-950/40 border-red-500/50 shadow-lg shadow-red-950/30'
          : 'bg-slate-900/90 border-slate-800'
      }`}>
        {/* Top title and status tag */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{name}</span>
          </div>

          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${
            !faceDetected
              ? 'bg-slate-800 text-slate-400'
              : isClosed
              ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}>
            {isClosed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {faceDetected ? (isClosed ? 'CLOSED' : 'OPEN') : 'NO FACE'}
          </span>
        </div>

        {/* EAR Numeric Value */}
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-xs text-slate-400">Eye Aspect Ratio (EAR)</span>
          <span className={`text-xl font-mono font-bold ${
            !faceDetected
              ? 'text-slate-500'
              : isClosed
              ? 'text-red-400'
              : 'text-emerald-400'
          }`}>
            {faceDetected ? earVal.toFixed(3) : '0.000'}
          </span>
        </div>

        {/* Progress meter with threshold marker */}
        <div className="relative w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-150 rounded-full ${
              isClosed ? 'bg-red-500' : 'bg-emerald-400'
            }`}
            style={{ width: faceDetected ? `${meterPercent}%` : '0%' }}
          />
          {/* Threshold indicator line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-10"
            style={{ left: `${thresholdPercent}%` }}
            title={`Threshold: ${earThreshold}`}
          />
        </div>

        {/* Extra info: Blendshape Blink Score if available */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
          <span>Threshold: {earThreshold}</span>
          {eyeData.blinkScore !== null && (
            <span>Blink Confidence: {(eyeData.blinkScore * 100).toFixed(0)}%</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 md:p-5 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Eye State Analysis</h3>
            <p className="text-xs text-slate-400">Continuous EAR & Blink metric</p>
          </div>
        </div>

        {/* Combined Overall Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Combined:</span>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
            !faceDetected
              ? 'bg-slate-800 text-slate-400'
              : overallClosed
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
          }`}>
            {!faceDetected ? 'WAITING' : overallClosed ? 'EYES CLOSED' : 'EYES OPEN'}
          </span>
        </div>
      </div>

      {/* Two-Column Grid for Left and Right Eyes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        {renderEyeCard('Left Eye', leftEye)}
        {renderEyeCard('Right Eye', rightEye)}
      </div>

      {/* Average EAR summary */}
      <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-400">Smoothed Average EAR:</span>
        <span className="font-mono font-bold text-cyan-400">
          {faceDetected ? avgEAR.toFixed(3) : '--'}
        </span>
      </div>
    </div>
  );
}
