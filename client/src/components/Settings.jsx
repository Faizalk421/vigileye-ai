/**
 * Settings Component
 * Configuration modal / panel for tuning EAR threshold, drowsiness duration,
 * camera selection, mesh overlay toggles, and calibration.
 */

import React from 'react';
import { Settings as SettingsIcon, Sliders, Eye, Clock, Layers, Sparkles, RotateCcw, X, Camera } from 'lucide-react';

export default function Settings({
  settings,
  updateSetting,
  availableCameras,
  isOpen,
  onClose,
  calibration,
  startCalibration,
  isCameraActive
}) {
  if (!isOpen) return null;

  const handleResetDefaults = () => {
    updateSetting('earThreshold', 0.21);
    updateSetting('drowsinessThreshold', 1.5);
    updateSetting('alarmVolume', 0.8);
    updateSetting('alarmPattern', 'siren');
    updateSetting('alarmEnabled', true);
    updateSetting('isMuted', false);
    updateSetting('showMesh', true);
    updateSetting('showLabels', true);
    updateSetting('smoothingFrames', 3);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Detection & Alarm Settings</h2>
              <p className="text-xs text-slate-400">Configure sensitivity thresholds & preferences</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-5 mt-5">
          {/* Camera Device Selection (if multiple devices) */}
          {availableCameras && availableCameras.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span>Camera Input Device</span>
                </div>
              </div>
              <select
                value={settings.selectedCameraId}
                onChange={(e) => updateSetting('selectedCameraId', e.target.value)}
                className="w-full bg-slate-900 text-xs text-slate-200 border border-slate-700 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {availableCameras.map(cam => (
                  <option key={cam.deviceId} value={cam.deviceId}>
                    {cam.label || 'Webcam'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* EAR Threshold Slider */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>Eye Aspect Ratio (EAR) Threshold</span>
              </div>
              <span className="font-mono font-bold text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800">
                {settings.earThreshold.toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              EAR values below this threshold are classified as CLOSED. Default is 0.21. Lower values require tighter eye closure.
            </p>
            <input
              type="range"
              min="0.12"
              max="0.32"
              step="0.01"
              value={settings.earThreshold}
              onChange={(e) => updateSetting('earThreshold', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.12 (Strict)</span>
              <span>0.21 (Recommended)</span>
              <span>0.32 (Sensitive)</span>
            </div>
          </div>

          {/* Drowsiness Duration Slider */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Continuous Closure Duration Before Alarm</span>
              </div>
              <span className="font-mono font-bold text-indigo-400 bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-800">
                {settings.drowsinessThreshold.toFixed(1)}s
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              How long eyes must remain continuously closed to trigger drowsiness alarm. Blinks (0.1s - 0.4s) will not trigger alarm.
            </p>
            <input
              type="range"
              min="0.6"
              max="4.0"
              step="0.1"
              value={settings.drowsinessThreshold}
              onChange={(e) => updateSetting('drowsinessThreshold', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.6s (Instant)</span>
              <span>1.5s (Standard)</span>
              <span>4.0s (Relaxed)</span>
            </div>
          </div>

          {/* Auto Calibration Helper */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-950/60 border border-indigo-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-indigo-200">Auto-Calibrate My Eyes</span>
              </div>
              <button
                onClick={startCalibration}
                disabled={!isCameraActive || calibration.isCalibrating}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-40"
              >
                {calibration.isCalibrating ? `Calibrating ${calibration.progress}%` : 'Start Calibration'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Look normally at your camera for 2.5 seconds. The system will measure your open-eye baseline and set your optimal threshold automatically.
            </p>
          </div>

          {/* Temporal Smoothing Slider */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Noise Filter / Temporal Smoothing</span>
              </div>
              <span className="font-mono font-bold text-emerald-400">
                {settings.smoothingFrames} frames
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              step="1"
              value={settings.smoothingFrames}
              onChange={(e) => updateSetting('smoothingFrames', parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>1 frame (Fastest)</span>
              <span>3 frames (Balanced)</span>
              <span>6 frames (Smoothest)</span>
            </div>
          </div>

          {/* Visual Overlay Toggles */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              HUD Visualizer Elements
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={settings.showMesh}
                  onChange={(e) => updateSetting('showMesh', e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 w-4 h-4"
                />
                <span>Facial Contour Mesh</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={settings.showLabels}
                  onChange={(e) => updateSetting('showLabels', e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 w-4 h-4"
                />
                <span>Real-time EAR Labels</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
