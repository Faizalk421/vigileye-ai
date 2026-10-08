/**
 * React Hook: useEyeDetection
 * Orchestrates camera stream, real-time MediaPipe face processing, EAR smoothing,
 * drowsiness timer, blink counter, calibration, and alarm triggering.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { cameraService } from '../services/cameraService';
import { faceDetectionService } from '../services/faceDetection';
import { alarmService } from '../services/alarmService';

export function useEyeDetection() {
  // Video and Canvas DOM refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameId = useRef(null);

  // Settings State
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('eye_alarm_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      earThreshold: 0.21,
      drowsinessThreshold: 1.5, // seconds
      alarmEnabled: true,
      alarmVolume: 0.8,
      alarmPattern: 'siren',
      isMuted: false,
      showMesh: true,
      showLabels: true,
      smoothingFrames: 3, // moving average window
      selectedCameraId: ''
    };
  });

  // Save settings changes to localStorage
  useEffect(() => {
    localStorage.setItem('eye_alarm_settings', JSON.stringify(settings));
    alarmService.setVolume(settings.alarmVolume);
    alarmService.setMuted(settings.isMuted);
    alarmService.setPattern(settings.alarmPattern);
  }, [settings]);

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [cameraError, setCameraError] = useState(null);

  // Vision Model State
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelLoadingMessage, setModelLoadingMessage] = useState('');
  const [modelReady, setModelReady] = useState(false);
  const [modelError, setModelError] = useState(null);

  // Detection Real-time State
  const [detectionState, setDetectionState] = useState({
    faceDetected: false,
    faceCount: 0,
    leftEye: { ear: 0, isClosed: false, blinkScore: null },
    rightEye: { ear: 0, isClosed: false, blinkScore: null },
    overallClosed: false,
    avgEAR: 0,
    closedDuration: 0, // seconds
    isDrowsy: false,
    drowsinessProgress: 0, // 0 to 1
    fps: 0
  });

  // Session Statistics
  const [stats, setStats] = useState({
    blinkCount: 0,
    drowsinessEventsCount: 0,
    sessionStartTime: null,
    sessionUptimeSeconds: 0
  });

  // Calibration State
  const [calibration, setCalibration] = useState({
    isCalibrating: false,
    progress: 0,
    baselineEAR: null,
    recommendedThreshold: null
  });

  // Internal mutable tracking refs (to avoid stale closures in requestAnimationFrame loop)
  const isCameraActiveRef = useRef(false);
  const closedStartTimeRef = useRef(null);
  const wasClosedRef = useRef(false);
  const earHistoryRef = useRef([]);
  const lastBlinkTimeRef = useRef(0);
  const blinkCountRef = useRef(0);
  const drowsinessEventsRef = useRef(0);
  const isCalibratingRef = useRef(false);
  const calibrationSamplesRef = useRef([]);
  const frameCounterRef = useRef(0);
  const fpsRef = useRef(0);
  const fpsIntervalRef = useRef(0);
  const settingsRef = useRef(settings);
  const runDetectionLoopRef = useRef(null);

  // Sync settings ref
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Sync active camera ref
  useEffect(() => {
    isCameraActiveRef.current = isCameraActive;
  }, [isCameraActive]);

  // Enumerate cameras on mount
  useEffect(() => {
    cameraService.getAvailableCameras().then(cameras => {
      setAvailableCameras(cameras);
      if (cameras.length > 0) {
        setSettings(s => {
          if (!s.selectedCameraId) {
            return { ...s, selectedCameraId: cameras[0].deviceId };
          }
          return s;
        });
      }
    });
  }, []);

  // Initialize MediaPipe model
  const initModel = useCallback(async () => {
    if (modelReady || isModelLoading) return;
    setIsModelLoading(true);
    setModelError(null);
    try {
      await faceDetectionService.initialize((msg) => setModelLoadingMessage(msg));
      setModelReady(true);
      setIsModelLoading(false);
    } catch (err) {
      setModelError(err.message || 'Failed to load face detection model.');
      setIsModelLoading(false);
    }
  }, [modelReady, isModelLoading]);

  // Main Detection Loop
  const runDetectionLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Check if camera should stay running
    if (!isCameraActiveRef.current) {
      return;
    }

    // Always schedule next frame first as long as active!
    if (runDetectionLoopRef.current && isCameraActiveRef.current) {
      animFrameId.current = requestAnimationFrame(runDetectionLoopRef.current);
    }

    if (!video || video.ended) {
      return;
    }

    // Auto-resume if paused
    if (video.paused) {
      video.play().catch(() => {});
      return;
    }

    // Wait until video has valid dimensions and frame data
    if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
      return;
    }

    const now = performance.now();

    // Calculate FPS
    frameCounterRef.current += 1;
    if (now - fpsIntervalRef.current >= 1000) {
      fpsRef.current = Math.round((frameCounterRef.current * 1000) / (now - fpsIntervalRef.current));
      frameCounterRef.current = 0;
      fpsIntervalRef.current = now;
    }

    const currentThreshold = settingsRef.current.earThreshold;
    const drowsinessSecThreshold = settingsRef.current.drowsinessThreshold;

    // Run Landmarker
    const results = faceDetectionService.processVideoFrame(video, now, currentThreshold);

    // Apply smoothing window
    let smoothedEAR = results.avgEAR;
    if (results.faceDetected) {
      earHistoryRef.current.push(results.avgEAR);
      const maxWindow = settingsRef.current.smoothingFrames || 3;
      if (earHistoryRef.current.length > maxWindow) {
        earHistoryRef.current.shift();
      }
      const sum = earHistoryRef.current.reduce((a, b) => a + b, 0);
      smoothedEAR = Number((sum / earHistoryRef.current.length).toFixed(4));
    } else {
      earHistoryRef.current = [];
    }

    // Process Calibration if active
    if (isCalibratingRef.current) {
      if (results.faceDetected && smoothedEAR > 0.05) {
        calibrationSamplesRef.current.push(smoothedEAR);
        const targetSamples = 30; // ~1 second for fast, accurate calibration
        const progress = Math.min(100, Math.round((calibrationSamplesRef.current.length / targetSamples) * 100));
        setCalibration(c => ({
          ...c,
          progress,
          statusMessage: `Calibrating: ${progress}% (Keep eyes open & look at webcam)`
        }));

        if (calibrationSamplesRef.current.length >= targetSamples) {
          isCalibratingRef.current = false;
          const avgOpenEAR =
            calibrationSamplesRef.current.reduce((a, b) => a + b, 0) /
            calibrationSamplesRef.current.length;
          const calculatedThreshold = Number(
            Math.max(0.12, Math.min(0.35, avgOpenEAR * 0.72)).toFixed(3)
          );

          setCalibration({
            isCalibrating: false,
            progress: 100,
            baselineEAR: Number(avgOpenEAR.toFixed(3)),
            recommendedThreshold: calculatedThreshold,
            statusMessage: `Calibrated! Baseline EAR: ${avgOpenEAR.toFixed(3)}, New Threshold: ${calculatedThreshold}`
          });

          setSettings(s => ({ ...s, earThreshold: calculatedThreshold }));
        }
      } else {
        setCalibration(c => ({
          ...c,
          statusMessage: 'Searching for face... Please look directly at the webcam'
        }));
      }
    }

    // Analyze Eye Closure & Drowsiness
    const isCurrentlyClosed = results.faceDetected && results.bothClosed;
    let closedDurationSec = 0;
    let isDrowsy = false;

    if (isCurrentlyClosed) {
      if (!closedStartTimeRef.current) {
        closedStartTimeRef.current = now;
      }
      closedDurationSec = Number(((now - closedStartTimeRef.current) / 1000).toFixed(2));

      if (closedDurationSec >= drowsinessSecThreshold) {
        isDrowsy = true;
        if (!wasClosedRef.current) {
          drowsinessEventsRef.current += 1;
        }
      }
      wasClosedRef.current = true;
    } else {
      // Eyes are open: detect blink if closed previously for between 100ms and 600ms
      if (closedStartTimeRef.current) {
        const closedTime = (now - closedStartTimeRef.current) / 1000;
        if (closedTime >= 0.08 && closedTime < drowsinessSecThreshold) {
          // Normal blink
          if (now - lastBlinkTimeRef.current > 200) {
            blinkCountRef.current += 1;
            lastBlinkTimeRef.current = now;
          }
        }
      }
      closedStartTimeRef.current = null;
      wasClosedRef.current = false;
      closedDurationSec = 0;
      isDrowsy = false;
    }

    const progressRatio = Math.min(1, closedDurationSec / drowsinessSecThreshold);

    // Alarm management
    if (isDrowsy && settingsRef.current.alarmEnabled && !settingsRef.current.isMuted) {
      alarmService.play();
    } else {
      if (alarmService.isPlaying) {
        alarmService.stop();
      }
    }

    // Update state for UI
    setDetectionState({
      faceDetected: results.faceDetected,
      faceCount: results.faceCount,
      leftEye: {
        ear: results.leftEAR,
        isClosed: results.leftClosed,
        blinkScore: results.blinkLeft
      },
      rightEye: {
        ear: results.rightEAR,
        isClosed: results.rightClosed,
        blinkScore: results.blinkRight
      },
      overallClosed: isCurrentlyClosed,
      avgEAR: smoothedEAR,
      closedDuration: closedDurationSec,
      isDrowsy,
      drowsinessProgress: progressRatio,
      fps: fpsRef.current
    });

    setStats(prev => ({
      ...prev,
      blinkCount: blinkCountRef.current,
      drowsinessEventsCount: drowsinessEventsRef.current
    }));

    // Draw HUD Canvas Overlay
    if (canvas && video) {
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
      }
      faceDetectionService.drawHUD(canvas, video, results, {
        showMesh: settingsRef.current.showMesh,
        showEyes: true,
        showLabels: settingsRef.current.showLabels
      });
    }
  }, []);

  useEffect(() => {
    runDetectionLoopRef.current = runDetectionLoop;
  }, [runDetectionLoop]);

  // Start Camera and Detection Stream
  const startCamera = useCallback(async (customDeviceId = null) => {
    setCameraError(null);
    try {
      await initModel();

      const deviceId = customDeviceId || settings.selectedCameraId;
      const stream = await cameraService.startCamera(deviceId);

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        
        await new Promise((resolve) => {
          let resolved = false;
          const done = () => {
            if (!resolved) {
              resolved = true;
              video.play().catch(() => {}).finally(resolve);
            }
          };

          if (video.readyState >= 1) {
            done();
          } else {
            video.addEventListener('loadedmetadata', done, { once: true });
            video.addEventListener('loadeddata', done, { once: true });
            setTimeout(done, 1000); // safety fallback
          }
        });
      }

      isCameraActiveRef.current = true;
      setIsCameraActive(true);
      setStats(prev => ({
        ...prev,
        sessionStartTime: Date.now(),
        sessionUptimeSeconds: 0
      }));

      // Start detection loop
      if (runDetectionLoopRef.current) {
        if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
        animFrameId.current = requestAnimationFrame(runDetectionLoopRef.current);
      }
    } catch (err) {
      console.error('Camera startup error:', err);
      setCameraError(err.message || 'Failed to start camera.');
      isCameraActiveRef.current = false;
      setIsCameraActive(false);
    }
  }, [initModel, settings.selectedCameraId]);

  // Calibration trigger
  const startCalibration = useCallback(async () => {
    if (!isCameraActiveRef.current) {
      await startCamera();
    }
    setCalibration({
      isCalibrating: true,
      progress: 0,
      baselineEAR: null,
      recommendedThreshold: null,
      statusMessage: 'Calibrating... Look naturally at the camera'
    });
    isCalibratingRef.current = true;
    calibrationSamplesRef.current = [];
  }, [startCamera]);

  // Stop Camera and Detection
  const stopCamera = useCallback(() => {
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }

    alarmService.stop();
    cameraService.stopCamera();

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    setIsCameraActive(false);
    closedStartTimeRef.current = null;
    wasClosedRef.current = false;

    setDetectionState(prev => ({
      ...prev,
      faceDetected: false,
      faceCount: 0,
      overallClosed: false,
      closedDuration: 0,
      isDrowsy: false,
      drowsinessProgress: 0,
      fps: 0
    }));
  }, []);

  // Track session uptime
  useEffect(() => {
    let interval = null;
    if (isCameraActive) {
      interval = setInterval(() => {
        setStats(prev => ({
          ...prev,
          sessionUptimeSeconds: prev.sessionUptimeSeconds + 1
        }));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCameraActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  return {
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
    stopCamera,
    initModel
  };
}
