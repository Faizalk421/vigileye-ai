/**
 * CameraView Component
 * Displays live webcam stream with real-time facial landmark HUD canvas overlay,
 * camera controls, camera device selection, calibration trigger, and status badges.
 */

import React from 'react';
import { Camera, CameraOff, Sparkles, RefreshCw, AlertTriangle, Eye, Video } from 'lucide-react';

export default function CameraView({
  videoRef,
  canvasRef,
  isCameraActive,
  startCamera,
  stopCamera,
  availableCameras,
  selectedCameraId,
  onSelectCamera,
  cameraError,
  isModelLoading,
  modelLoadingMessage,
  detectionState,
  calibration,
  startCalibration
}) {
  const { faceDetected, faceCount, isDrowsy, overallClosed, closedDuration, fps } = detectionState;

  return (
    <div className="relative flex flex-col bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 md:p-5 shadow-2xl backdrop-blur-xl transition-all duration-300">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-wide">Live Webcam Feed</h2>
            <p className="text-xs text-slate-400">Real-time local computer-vision processing</p>
          </div>
        </div>

        {/* Camera Selector & Controls */}
        <div className="flex items-center gap-2">
          {availableCameras.length > 1 && (
            <select
              value={selectedCameraId}
              onChange={(e) => {
                onSelectCamera(e.target.value);
                if (isCameraActive) {
                  startCamera(e.target.value);
                }
              }}
              className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {availableCameras.map(cam => (
                <option key={cam.deviceId} value={cam.deviceId}>
                  {cam.label || 'Webcam'}
                </option>
              ))}
            </select>
          )}

          {isCameraActive ? (
            <button
              onClick={stopCamera}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-all text-xs font-semibold"
            >
              <CameraOff className="w-4 h-4" />
              Stop Camera
            </button>
          ) : (
            <button
              onClick={() => startCamera()}
              disabled={isModelLoading}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition-all text-xs disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              Start Camera
            </button>
          )}
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className={`relative mt-4 aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border transition-all duration-300 ${
        isDrowsy
          ? 'border-red-500 ring-4 ring-red-500/40 alarm-glow'
          : overallClosed
          ? 'border-amber-500/60 ring-2 ring-amber-500/20'
          : 'border-slate-800'
      }`}>
        {/* Video Element (mirrored for intuitive selfie preview) */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="absolute inset-0 w-full h-full object-cover -scale-x-100"
        />

        {/* Canvas HUD Overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* Inactive or Loading Placeholder Overlay */}
        {!isCameraActive && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 text-center p-6 backdrop-blur-sm">
            {isModelLoading ? (
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                <p className="text-sm font-medium text-slate-200">
                  {modelLoadingMessage || 'Loading MediaPipe Face Landmarker...'}
                </p>
                <p className="text-xs text-slate-500">Preparing client-side neural network</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                  <Video className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-slate-200">Webcam Inactive</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Click "Start Camera" to initialize real-time face landmark tracking and eye aspect ratio analysis.
                </p>
                <button
                  onClick={() => startCamera()}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition-all flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Start Detection Stream
                </button>
              </div>
            )}
          </div>
        )}

        {/* Floating HUD status badges on top of live video */}
        {isCameraActive && (
          <>
            {/* Top-Left: Face Detection Status */}
            <div className="absolute top-3 left-3 z-30 flex items-center gap-2">
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md border ${
                faceDetected
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40 shadow-sm'
                  : 'bg-amber-950/80 text-amber-400 border-amber-500/40 animate-pulse'
              }`}>
                <span className={`w-2 h-2 rounded-full ${faceDetected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                {faceDetected ? `Face Locked (${faceCount})` : 'Searching Face...'}
              </span>

              {/* FPS Counter */}
              <span className="px-2 py-1 rounded-full bg-slate-900/80 text-slate-300 text-[10px] font-mono border border-slate-700/60 backdrop-blur-md">
                {fps} FPS
              </span>
            </div>

            {/* Top-Right: Continuous Closure Duration Timer */}
            {overallClosed && (
              <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/90 text-red-300 border border-red-500/60 text-xs font-mono font-bold backdrop-blur-md animate-pulse">
                <Eye className="w-3.5 h-3.5 text-red-400" />
                <span>Closed: {closedDuration.toFixed(2)}s</span>
              </div>
            )}

            {/* Calibration in-progress overlay */}
            {calibration.isCalibrating && (
              <div className="absolute inset-x-4 top-14 z-30 p-3 rounded-xl bg-indigo-950/90 border border-indigo-500/50 backdrop-blur-md text-center shadow-xl">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-indigo-200">
                  <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
                  <span>Calibrating Open Eyes ({calibration.progress}%)</span>
                </div>
                <p className="text-[11px] text-indigo-300 mt-0.5">
                  {calibration.statusMessage || 'Keep your eyes open and look steadily at the webcam'}
                </p>
                <div className="mt-2 w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-400 h-full transition-all duration-100"
                    style={{ width: `${calibration.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Bottom Floating Warning Banner inside camera viewport when drowsy */}
            {isDrowsy && (
              <div className="absolute inset-x-4 bottom-4 z-30 p-3 rounded-xl bg-red-600/95 text-white font-black text-center text-sm md:text-base tracking-wider uppercase border border-red-400 shadow-2xl flex items-center justify-center gap-2 animate-bounce">
                <AlertTriangle className="w-5 h-5 text-yellow-300 animate-spin" />
                <span>⚠️ WAKE UP! EYES CLOSED!</span>
                <AlertTriangle className="w-5 h-5 text-yellow-300 animate-spin" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Error Message if camera failed */}
      {cameraError && (
        <div className="mt-3 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-red-200">Camera Access Error</p>
            <p>{cameraError}</p>
          </div>
        </div>
      )}

      {/* Footer controls: Calibration bar & Helper tips */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={startCalibration}
            disabled={calibration.isCalibrating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30 transition-all text-xs font-semibold disabled:opacity-40 shadow-sm shadow-indigo-500/10"
            title="Calibrate your open eye aspect ratio baseline"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            {calibration.isCalibrating ? `Calibrating (${calibration.progress}%)` : 'Calibrate Open Eyes'}
          </button>

          {calibration.recommendedThreshold && (
            <span className="text-[11px] font-semibold text-indigo-300 bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-700/60 shadow-sm">
              ✨ Baseline: {calibration.baselineEAR} • EAR Threshold: {calibration.recommendedThreshold}
            </span>
          )}
        </div>

        <p className="text-[11px] text-slate-500">
          Tip: Ensure good front lighting facing the webcam for best tracking.
        </p>
      </div>

      {/* Calibration Progress Bar */}
      {calibration.isCalibrating && (
        <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-indigo-500 h-full transition-all duration-100"
            style={{ width: `${calibration.progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
