import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/authService';
import { sessionService } from '../services/sessionService';
import { alarmService } from '../services/alarmService';
import { useNotification } from '../context/NotificationContext';
import {
  Sliders,
  Volume2,
  Camera,
  Moon,
  Sun,
  Shield,
  Trash2,
  Save,
  CheckCircle2,
  RefreshCw,
  Eye,
  VolumeX,
  Sparkles
} from 'lucide-react';

export default function SettingsPage() {
  const { user, updateProfileState } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { showToast } = useNotification();

  const [settings, setSettings] = useState(() => {
    return {
      earThreshold: user?.settings?.earThreshold || 0.21,
      drowsinessThreshold: user?.settings?.drowsinessThreshold || 1.5,
      alarmVolume: user?.settings?.alarmVolume || 0.8,
      alarmPattern: user?.settings?.alarmPattern || 'siren',
      isMuted: user?.settings?.isMuted || false,
      showMesh: user?.settings?.showMesh ?? true,
      showLabels: user?.settings?.showLabels ?? true,
      smoothingFrames: user?.settings?.smoothingFrames || 3,
      selectedCameraId: user?.settings?.selectedCameraId || '',
      darkMode: user?.settings?.darkMode ?? true,
      compactMode: user?.settings?.compactMode || false,
      localProcessingOnly: user?.settings?.localProcessingOnly ?? true,
      allowAnalytics: user?.settings?.allowAnalytics ?? true
    };
  });

  const [availableCameras, setAvailableCameras] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Query connected webcam devices
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setAvailableCameras(videoDevices);
      }).catch(console.warn);
    }
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleTestAlarm = () => {
    alarmService.setVolume(settings.alarmVolume);
    alarmService.setPattern(settings.alarmPattern);
    alarmService.testAlarm(1500);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await authService.updateSettings(settings);
      if (res.success) {
        localStorage.setItem('eye_alarm_settings', JSON.stringify(settings));
        showToast('Application settings saved successfully!', 'success');
      }
    } catch (err) {
      showToast('Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Warning: This will permanently delete all your monitoring sessions and telemetry. Proceed?')) {
      return;
    }
    try {
      await sessionService.clearAllSessions();
      showToast('All monitoring history permanently erased.', 'success');
    } catch (err) {
      showToast('Failed to clear history', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-900">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-cyan-400" />
            <span>Detection & App Settings</span>
          </h1>
          <p className="text-xs text-slate-400">
            Personalize your computer vision thresholds, audio alarms, and appearance.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs hover:brightness-110 shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2"
        >
          {isSaving ? (
            <span className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Preferences</span>
            </>
          )}
        </button>
      </div>

      {/* 1. Detection Settings */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          <span>Eye Detection & EAR Calibration</span>
        </h3>

        <div className="space-y-4">
          {/* EAR Threshold */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300">EAR Closure Threshold</span>
              <span className="text-cyan-400 font-mono text-sm">{settings.earThreshold.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.12"
              max="0.32"
              step="0.01"
              value={settings.earThreshold}
              onChange={(e) => handleChange('earThreshold', parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Eyes with Aspect Ratio below this value are treated as closed. Lower for narrow eyes, higher for wide eyes.
            </p>
          </div>

          {/* Drowsiness Duration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300">Drowsiness Alarm Delay (Seconds)</span>
              <span className="text-cyan-400 font-mono text-sm">{settings.drowsinessThreshold.toFixed(1)}s</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="4.0"
              step="0.1"
              value={settings.drowsinessThreshold}
              onChange={(e) => handleChange('drowsinessThreshold', parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Consecutive eye-closure duration required before the alarm sounds (default: 1.5s).
            </p>
          </div>

          {/* Temporal Smoothing Frames */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300">Temporal Smoothing Frames</span>
              <span className="text-cyan-400 font-mono text-sm">{settings.smoothingFrames} frames</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={settings.smoothingFrames}
              onChange={(e) => handleChange('smoothingFrames', parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Moving average window size to prevent video jitter or lighting noise false positives.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Alarm Settings */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-amber-400" />
          <span>Intelligent Audio Alarm Configuration</span>
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'siren', label: 'Emergency Siren' },
              { id: 'radar', label: 'Radar Ping' },
              { id: 'digital', label: 'Digital Beep' },
              { id: 'continuous', label: 'Continuous Tone' }
            ].map((pat) => (
              <button
                key={pat.id}
                type="button"
                onClick={() => handleChange('alarmPattern', pat.id)}
                className={`p-3 rounded-2xl border text-xs font-semibold transition-all ${
                  settings.alarmPattern === pat.id
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {pat.label}
              </button>
            ))}
          </div>

          {/* Volume Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300">Alarm Volume Level</span>
              <span className="text-amber-400 font-mono">{Math.round(settings.alarmVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.alarmVolume}
              onChange={(e) => handleChange('alarmVolume', parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleTestAlarm}
              className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white inline-flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>Test Audio Alarm</span>
            </button>

            <button
              type="button"
              onClick={() => handleChange('isMuted', !settings.isMuted)}
              className={`px-4 py-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-2 transition-colors ${
                settings.isMuted
                  ? 'bg-red-950/40 border-red-500/40 text-red-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              {settings.isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              <span>{settings.isMuted ? 'Muted' : 'Sound Active'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Camera Device Settings */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Camera className="w-4 h-4 text-sky-400" />
          <span>Camera Hardware Selector</span>
        </h3>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">Selected Video Device</label>
          <select
            value={settings.selectedCameraId}
            onChange={(e) => handleChange('selectedCameraId', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">Default Web Camera</option>
            {availableCameras.map((cam) => (
              <option key={cam.deviceId} value={cam.deviceId}>
                {cam.label || `Camera ${cam.deviceId.slice(0, 8)}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Privacy & Data Purge */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Privacy & Data Controls</span>
        </h3>

        <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
          <div>
            <h4 className="text-xs font-semibold text-white">Local-Only Neural Vision</h4>
            <p className="text-[11px] text-slate-400">All 478 face landmarks stay strictly in browser RAM</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
            Enforced
          </span>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-white">Purge Monitoring History</h4>
            <p className="text-[11px] text-slate-400">Permanently delete all session metrics and telemetry records</p>
          </div>
          <button
            type="button"
            onClick={handleClearHistory}
            className="px-4 py-2 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red-900/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge All Telemetry</span>
          </button>
        </div>
      </div>
    </div>
  );
}
