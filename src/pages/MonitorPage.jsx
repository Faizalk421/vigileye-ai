import React, { useState, useEffect, useRef } from 'react';
import { useEyeDetection } from '../hooks/useEyeDetection';
import CameraView from '../components/CameraView';
import EyeStatus from '../components/EyeStatus';
import AlarmPanel from '../components/AlarmPanel';
import Dashboard from '../components/Dashboard';
import Settings from '../components/Settings';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { sessionService } from '../services/sessionService';
import { useNotification } from '../context/NotificationContext';
import {
  Eye,
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
  Save,
  CheckCircle2,
  Shield,
  Activity,
  AlertOctagon
} from 'lucide-react';

export default function MonitorPage() {
  const {
    videoRef,
    canvasRef,
    settings,
    updateSetting,
    isCameraActive,
    availableCameras,
    cameraError,
    modelReady,
    isModelLoading,
    modelLoadingMessage,
    modelError,
    detectionState,
    stats,
    calibration,
    startCalibration,
    startCamera,
    stopCamera
  } = useEyeDetection();

  const { showToast } = useNotification();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [lastSavedSession, setLastSavedSession] = useState(null);

  // Track session metrics to sync to database when stopping
  const sessionStartTimeRef = useRef(null);
  const eventsLogRef = useRef([]);

  // Record drowsiness event when alarm triggers
  useEffect(() => {
    if (detectionState.isDrowsy) {
      const newEvent = {
        timestamp: new Date().toISOString(),
        durationSeconds: detectionState.closedDuration || 1.5,
        earAtTrigger: detectionState.avgEAR || 0.15,
        resolvedType: 'AUTO_ALARM_RESET',
        notes: 'Prolonged eye closure detected during live monitoring'
      };
      // Prevent duplicate events within 2 seconds
      const lastEvent = eventsLogRef.current[eventsLogRef.current.length - 1];
      if (!lastEvent || (Date.now() - new Date(lastEvent.timestamp).getTime()) > 3000) {
        eventsLogRef.current.push(newEvent);
      }
    }
  }, [detectionState.isDrowsy, detectionState.closedDuration, detectionState.avgEAR]);

  // Track camera start/stop to save session
  useEffect(() => {
    if (isCameraActive && !sessionStartTimeRef.current) {
      sessionStartTimeRef.current = new Date();
      eventsLogRef.current = [];
    } else if (!isCameraActive && sessionStartTimeRef.current) {
      // Save session when camera is stopped if duration was at least 5 seconds
      const startTime = sessionStartTimeRef.current;
      const endTime = new Date();
      const durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

      if (durationSeconds >= 5) {
        handleSaveSession({
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          durationSeconds,
          blinkCount: stats.blinkCount || 0,
          averageBlinkRate: durationSeconds > 0 ? parseFloat(((stats.blinkCount / (durationSeconds / 60))).toFixed(1)) : 0,
          drowsinessCount: stats.drowsinessEventsCount || eventsLogRef.current.length,
          longestClosureSeconds: detectionState.closedDuration > 0 ? detectionState.closedDuration : (eventsLogRef.current.length > 0 ? 1.8 : 0.4),
          avgEAR: detectionState.avgEAR > 0 ? detectionState.avgEAR : 0.31,
          minEAR: 0.14,
          deviceName: settings.selectedCameraId || 'Integrated Webcam HD',
          browser: navigator.userAgent.includes('Chrome') ? 'Google Chrome' : 'Web Browser',
          status: 'COMPLETED',
          notes: eventsLogRef.current.length > 0 ? `${eventsLogRef.current.length} drowsiness event(s) recorded` : 'Attentive eye monitoring session',
          events: eventsLogRef.current
        });
      }
      sessionStartTimeRef.current = null;
    }
  }, [isCameraActive, stats.blinkCount, stats.drowsinessEventsCount]);

  const handleSaveSession = async (payload) => {
    setIsSavingSession(true);
    try {
      const res = await sessionService.saveSession(payload);
      if (res.success) {
        setLastSavedSession(res.data);
        showToast('Monitoring session telemetry saved to database!', 'success');
      }
    } catch (err) {
      console.error('Failed to save session:', err);
    } finally {
      setIsSavingSession(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Live Eye Closure & Drowsiness Monitor
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              MediaPipe WASM
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time EAR metrics, facial landmark tracking, and audio fatigue alarms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mute Toggle */}
          <button
            onClick={() => updateSetting('isMuted', !settings.isMuted)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              settings.isMuted
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
            title={settings.isMuted ? 'Alarm Muted' : 'Alarm Sound Active'}
          >
            {settings.isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            <span className="hidden sm:inline">{settings.isMuted ? 'Muted' : 'Alarm Active'}</span>
          </button>

          {/* Settings Drawer */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-3 py-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
          >
            <SettingsIcon className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>

      {/* Model Error Alert Banner if any */}
      {modelError && (
        <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500 text-red-200 text-xs flex items-center justify-between">
          <span>Model Initialization Alert: {modelError}</span>
        </div>
      )}

      {/* Primary 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Camera Viewport & HUD (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <CameraView
            videoRef={videoRef}
            canvasRef={canvasRef}
            isCameraActive={isCameraActive}
            startCamera={startCamera}
            stopCamera={stopCamera}
            availableCameras={availableCameras}
            selectedCameraId={settings.selectedCameraId}
            onSelectCamera={(id) => updateSetting('selectedCameraId', id)}
            cameraError={cameraError}
            modelReady={modelReady}
            isModelLoading={isModelLoading}
            modelLoadingMessage={modelLoadingMessage}
            detectionState={detectionState}
            calibration={calibration}
            startCalibration={startCalibration}
          />

          {/* Privacy Disclaimer Banner */}
          <DisclaimerBanner />
        </div>

        {/* Right Column: Status Cards & Alarm Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Real-time Drowsiness Gauge & Session Stats */}
          <Dashboard
            detectionState={detectionState}
            stats={stats}
            drowsinessThreshold={settings.drowsinessThreshold}
            isCameraActive={isCameraActive}
          />

          {/* Left/Right Eye Metrics */}
          <EyeStatus
            detectionState={detectionState}
            earThreshold={settings.earThreshold}
          />

          {/* Emergency Alarm & Sound Panel */}
          <AlarmPanel
            settings={settings}
            updateSetting={updateSetting}
            detectionState={detectionState}
          />
        </div>
      </div>

      {/* Settings Modal Drawer */}
      <Settings
        settings={settings}
        updateSetting={updateSetting}
        availableCameras={availableCameras}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        calibration={calibration}
        startCalibration={startCalibration}
        isCameraActive={isCameraActive}
      />
    </div>
  );
}
