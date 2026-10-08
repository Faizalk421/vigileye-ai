/**
 * AlarmPanel Component
 * Handles alarm status, emergency alert display, mute toggle, test alarm,
 * volume slider, and tone pattern selection.
 */

import React, { useState } from 'react';
import { Volume2, VolumeX, Bell, BellOff, Play, Square, AlertOctagon, ShieldAlert, Radio } from 'lucide-react';
import { alarmService } from '../services/alarmService';

export default function AlarmPanel({
  settings,
  updateSetting,
  detectionState
}) {
  const { isDrowsy, closedDuration } = detectionState;
  const [isTesting, setIsTesting] = useState(false);

  const handleTestAlarm = () => {
    if (isTesting) {
      alarmService.stop();
      setIsTesting(false);
      return;
    }

    setIsTesting(true);
    alarmService.testAlarm(2500);
    setTimeout(() => {
      setIsTesting(false);
    }, 2500);
  };

  const soundPatterns = [
    { id: 'siren', label: 'Warble Siren' },
    { id: 'pulse', label: 'Staccato Pulse' },
    { id: 'klaxon', label: 'Dual Klaxon' },
    { id: 'radar', label: 'Radar Sweep' }
  ];

  return (
    <div className={`rounded-2xl p-4 md:p-5 border transition-all duration-300 backdrop-blur-xl ${
      isDrowsy
        ? 'bg-red-950/90 border-red-500 ring-4 ring-red-500/40 shadow-2xl shadow-red-950/80 alarm-glow'
        : 'bg-slate-900/90 border-slate-800/80 shadow-2xl'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border ${
            isDrowsy
              ? 'bg-red-500 text-white border-red-400 animate-bounce'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Alarm System</h3>
            <p className="text-xs text-slate-400">Auditory and visual alert triggers</p>
          </div>
        </div>

        {/* Alarm State Badge */}
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
          !settings.alarmEnabled
            ? 'bg-slate-800 text-slate-400'
            : settings.isMuted
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            : isDrowsy
            ? 'bg-red-500 text-white animate-ping'
            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            !settings.alarmEnabled ? 'bg-slate-500' : settings.isMuted ? 'bg-amber-400' : isDrowsy ? 'bg-white' : 'bg-emerald-400'
          }`} />
          {!settings.alarmEnabled
            ? 'DISABLED'
            : settings.isMuted
            ? 'MUTED'
            : isDrowsy
            ? 'ALARM SOUNDING!'
            : 'ARMED'}
        </span>
      </div>

      {/* Flashing Emergency Banner during Drowsiness */}
      {isDrowsy && (
        <div className="mt-4 p-4 rounded-xl bg-red-600 text-white font-black text-center shadow-2xl border-2 border-yellow-300 flex flex-col items-center gap-1 animate-pulse">
          <div className="flex items-center gap-2 text-base md:text-lg tracking-wider">
            <AlertOctagon className="w-6 h-6 text-yellow-300" />
            <span>⚠️ WAKE UP! EYES CLOSED!</span>
            <AlertOctagon className="w-6 h-6 text-yellow-300" />
          </div>
          <p className="text-xs font-medium text-red-100">
            Eyes closed for {closedDuration.toFixed(1)}s (Threshold: {settings.drowsinessThreshold}s)
          </p>
        </div>
      )}

      {/* Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {/* Enable / Disable Alarm Toggle */}
        <button
          onClick={() => updateSetting('alarmEnabled', !settings.alarmEnabled)}
          className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all ${
            settings.alarmEnabled
              ? 'bg-slate-800/80 text-slate-200 border-slate-700 hover:bg-slate-800'
              : 'bg-slate-900/40 text-slate-500 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {settings.alarmEnabled ? <Bell className="w-4 h-4 text-cyan-400" /> : <BellOff className="w-4 h-4" />}
            <span>Alarm State</span>
          </div>
          <span className={`px-2 py-0.5 rounded font-bold ${
            settings.alarmEnabled ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500'
          }`}>
            {settings.alarmEnabled ? 'ACTIVE' : 'OFF'}
          </span>
        </button>

        {/* Mute Toggle */}
        <button
          onClick={() => updateSetting('isMuted', !settings.isMuted)}
          className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all ${
            settings.isMuted
              ? 'bg-amber-950/30 text-amber-300 border-amber-500/40'
              : 'bg-slate-800/80 text-slate-200 border-slate-700 hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {settings.isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>Audio Mute</span>
          </div>
          <span className={`px-2 py-0.5 rounded font-bold ${
            settings.isMuted ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
          }`}>
            {settings.isMuted ? 'MUTED' : 'UNMUTED'}
          </span>
        </button>
      </div>

      {/* Sound Style Picker */}
      <div className="mt-4">
        <label className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          Alarm Sound Tone
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {soundPatterns.map(pattern => (
            <button
              key={pattern.id}
              onClick={() => updateSetting('alarmPattern', pattern.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                settings.alarmPattern === pattern.id
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
              }`}
            >
              {pattern.label}
            </button>
          ))}
        </div>
      </div>

      {/* Volume Slider & Test Alarm Button */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
          <Volume2 className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.alarmVolume}
            onChange={(e) => updateSetting('alarmVolume', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <span className="text-xs font-mono text-slate-400 w-10 text-right">
            {Math.round(settings.alarmVolume * 100)}%
          </span>
        </div>

        {/* Test Alarm Button */}
        <button
          onClick={handleTestAlarm}
          className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all w-full sm:w-auto ${
            isTesting
              ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/30'
              : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
          }`}
        >
          {isTesting ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {isTesting ? 'Testing Sound...' : 'Test Alarm Sound'}
        </button>
      </div>
    </div>
  );
}
