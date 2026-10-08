/**
 * Face Detection & Landmark Service
 * Uses MediaPipe Vision FaceLandmarker with GPU/WebGL acceleration.
 * Performs real-time facial landmark extraction, EAR calculation, and canvas overlay HUD rendering.
 */

import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import {
  calculateEAR,
  extractBlinkBlendshapes,
  isEyeClosed,
  LEFT_EYE_LANDMARKS,
  RIGHT_EYE_LANDMARKS,
  LEFT_EYE_CONTOUR,
  RIGHT_EYE_CONTOUR,
  LEFT_EYEBROW,
  RIGHT_EYEBROW
} from '../utils/eyeAspectRatio';

async function createLandmarkerInstance(vision, modelPath) {
  // First try GPU delegate for maximum performance
  try {
    return await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: modelPath,
        delegate: 'GPU'
      },
      outputFaceBlendshapes: true,
      runningMode: 'VIDEO',
      numFaces: 1,
      minFaceDetectionConfidence: 0.3,
      minFacePresenceConfidence: 0.3,
      minTrackingConfidence: 0.3
    });
  } catch (gpuError) {
    console.warn(`GPU delegate failed for ${modelPath}, falling back to CPU delegate:`, gpuError);
    // Fallback to CPU delegate if WebGL is unavailable
    return await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: modelPath,
        delegate: 'CPU'
      },
      outputFaceBlendshapes: true,
      runningMode: 'VIDEO',
      numFaces: 1,
      minFaceDetectionConfidence: 0.3,
      minFacePresenceConfidence: 0.3,
      minTrackingConfidence: 0.3
    });
  }
}

class FaceDetectionService {
  constructor() {
    this.faceLandmarker = null;
    this.isLoading = false;
    this.isReady = false;
    this.initError = null;
    this.lastTimestamp = 0;
  }

  /**
   * Initialize the FaceLandmarker task
   * Loads WASM and model binary with comprehensive fallbacks
   */
  async initialize(onProgress = null) {
    if (this.isReady && this.faceLandmarker) {
      return this.faceLandmarker;
    }

    if (this.isLoading) {
      // Wait until finished loading
      while (this.isLoading) {
        await new Promise(r => setTimeout(r, 100));
      }
      return this.faceLandmarker;
    }

    this.isLoading = true;
    this.initError = null;

    try {
      if (onProgress) onProgress('Loading vision processor WASM...');

      // Attempt local WASM first, fallback to CDN
      let vision;
      try {
        vision = await FilesetResolver.forVisionTasks('/wasm');
      } catch (localWasmErr) {
        console.warn('Local WASM failed, falling back to CDN:', localWasmErr);
        vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.0/wasm'
        );
      }

      if (onProgress) onProgress('Loading Face Landmarker model...');

      // Attempt local model asset first, fallback to CDN
      let landmarker;
      try {
        landmarker = await createLandmarkerInstance(vision, '/models/face_landmarker.task');
      } catch (localModelErr) {
        console.warn('Local model failed, falling back to CDN model:', localModelErr);
        if (!vision) {
          vision = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.0/wasm'
          );
        }
        landmarker = await createLandmarkerInstance(
          vision,
          'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
        );
      }

      this.faceLandmarker = landmarker;
      this.isReady = true;
      this.lastTimestamp = 0;
      if (onProgress) onProgress('Ready');
      return this.faceLandmarker;
    } catch (err) {
      console.error('Failed to initialize FaceLandmarker:', err);
      // Secondary fallback directly to full CDN
      try {
        if (onProgress) onProgress('Connecting to vision cloud fallback...');
        const cdnVision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.0/wasm'
        );
        this.faceLandmarker = await createLandmarkerInstance(
          cdnVision,
          'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
        );
        this.isReady = true;
        this.lastTimestamp = 0;
        if (onProgress) onProgress('Ready');
        return this.faceLandmarker;
      } catch (fatalErr) {
        this.initError = fatalErr.message || 'Failed to initialize face detector model.';
        throw fatalErr;
      }
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Process a single video frame and return detection metrics
   * @param {HTMLVideoElement} videoElement 
   * @param {number} timestamp 
   * @param {number} earThreshold 
   * @returns {Object} Detection results
   */
  processVideoFrame(videoElement, timestamp, earThreshold = 0.21) {
    const emptyResult = {
      faceDetected: false,
      faceCount: 0,
      landmarks: null,
      leftEAR: 0,
      rightEAR: 0,
      avgEAR: 0,
      leftClosed: false,
      rightClosed: false,
      bothClosed: false,
      blinkLeft: null,
      blinkRight: null,
      blendshapes: null
    };

    if (!this.faceLandmarker || !this.isReady) {
      return emptyResult;
    }

    if (
      !videoElement ||
      videoElement.readyState < 2 ||
      !videoElement.videoWidth ||
      !videoElement.videoHeight ||
      videoElement.videoWidth === 0 ||
      videoElement.videoHeight === 0
    ) {
      return emptyResult;
    }

    try {
      // Ensure strictly monotonically increasing timestamp in integer milliseconds
      const nowMs = Math.round(timestamp || performance.now());
      const safeTimestamp = Math.max((this.lastTimestamp || 0) + 1, nowMs);
      this.lastTimestamp = safeTimestamp;

      const results = this.faceLandmarker.detectForVideo(videoElement, safeTimestamp);

      if (!results || !results.faceLandmarks || results.faceLandmarks.length === 0) {
        return emptyResult;
      }

      const landmarks = results.faceLandmarks[0];
      const faceCount = results.faceLandmarks.length;
      const { blinkLeft, blinkRight } = extractBlinkBlendshapes(results.faceBlendshapes);

      const leftEAR = calculateEAR(landmarks, LEFT_EYE_LANDMARKS);
      const rightEAR = calculateEAR(landmarks, RIGHT_EYE_LANDMARKS);
      const avgEAR = Number(((leftEAR + rightEAR) / 2).toFixed(4));

      const leftClosed = isEyeClosed(leftEAR, earThreshold, blinkLeft);
      const rightClosed = isEyeClosed(rightEAR, earThreshold, blinkRight);
      const bothClosed = leftClosed && rightClosed;

      return {
        faceDetected: true,
        faceCount,
        landmarks,
        leftEAR,
        rightEAR,
        avgEAR,
        leftClosed,
        rightClosed,
        bothClosed,
        blinkLeft,
        blinkRight,
        blendshapes: results.faceBlendshapes
      };
    } catch (err) {
      console.warn('Face detection frame processing warning:', err);
      return emptyResult;
    }
  }

  /**
   * Draw high-tech HUD visualizer on canvas
   */
  drawHUD(canvas, videoElement, detectionData, options = {}) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (!detectionData || !detectionData.faceDetected || !detectionData.landmarks) {
      return;
    }

    const { landmarks, leftClosed, rightClosed, leftEAR, rightEAR } = detectionData;
    const { showMesh = true, showEyes = true, showLabels = true } = options;

    const toCanvasPoint = (pt) => ({
      x: (1 - pt.x) * width, // Mirrored for natural selfie view
      y: pt.y * height
    });

    // Helper: Draw path from array of landmark indices
    const drawContour = (indices, strokeColor, fillColor = null, lineWidth = 2) => {
      if (!indices || indices.length === 0) return;
      ctx.beginPath();
      const p0 = toCanvasPoint(landmarks[indices[0]]);
      ctx.moveTo(p0.x, p0.y);

      for (let i = 1; i < indices.length; i++) {
        const p = toCanvasPoint(landmarks[indices[i]]);
        ctx.lineTo(p.x, p.y);
      }

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fill();
      }
    };

    if (showMesh) {
      // Draw subtle face oval boundary
      const faceOval = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10];
      drawContour(faceOval, 'rgba(56, 189, 248, 0.25)', 'rgba(56, 189, 248, 0.02)', 1.5);

      // Draw eyebrows
      drawContour(LEFT_EYEBROW, 'rgba(147, 197, 253, 0.6)', null, 2);
      drawContour(RIGHT_EYEBROW, 'rgba(147, 197, 253, 0.6)', null, 2);
    }

    if (showEyes) {
      const leftColor = leftClosed ? '#ef4444' : '#22c55e';
      const rightColor = rightClosed ? '#ef4444' : '#22c55e';
      const leftBg = leftClosed ? 'rgba(239, 68, 68, 0.25)' : 'rgba(34, 197, 94, 0.15)';
      const rightBg = rightClosed ? 'rgba(239, 68, 68, 0.25)' : 'rgba(34, 197, 94, 0.15)';

      // Draw Left Eye
      drawContour(LEFT_EYE_CONTOUR, leftColor, leftBg, 2.5);

      // Draw Right Eye
      drawContour(RIGHT_EYE_CONTOUR, rightColor, rightBg, 2.5);

      // Draw Iris center point if open
      if (!leftClosed && landmarks[468]) {
        const pt = toCanvasPoint(landmarks[468]);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3.5, 0, 2 * Math.PI);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      if (!rightClosed && landmarks[473]) {
        const pt = toCanvasPoint(landmarks[473]);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3.5, 0, 2 * Math.PI);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw 6 key EAR landmark dots for Left Eye
      Object.values(LEFT_EYE_LANDMARKS).forEach(idx => {
        if (landmarks[idx]) {
          const pt = toCanvasPoint(landmarks[idx]);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2.5, 0, 2 * Math.PI);
          ctx.fillStyle = leftClosed ? '#ef4444' : '#4ade80';
          ctx.fill();
        }
      });

      // Draw 6 key EAR landmark dots for Right Eye
      Object.values(RIGHT_EYE_LANDMARKS).forEach(idx => {
        if (landmarks[idx]) {
          const pt = toCanvasPoint(landmarks[idx]);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2.5, 0, 2 * Math.PI);
          ctx.fillStyle = rightClosed ? '#ef4444' : '#4ade80';
          ctx.fill();
        }
      });

      if (showLabels) {
        // Label left eye
        const lCenter = toCanvasPoint(landmarks[159] || landmarks[33]);
        ctx.fillStyle = leftClosed ? '#ef4444' : '#22c55e';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`L: ${leftEAR.toFixed(2)} ${leftClosed ? 'CLOSED' : 'OPEN'}`, lCenter.x - 35, lCenter.y - 18);

        // Label right eye
        const rCenter = toCanvasPoint(landmarks[386] || landmarks[362]);
        ctx.fillStyle = rightClosed ? '#ef4444' : '#22c55e';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`R: ${rightEAR.toFixed(2)} ${rightClosed ? 'CLOSED' : 'OPEN'}`, rCenter.x - 35, rCenter.y - 18);
      }
    }
  }

  destroy() {
    if (this.faceLandmarker) {
      try {
        this.faceLandmarker.close();
      } catch (e) {
        console.warn('Error closing landmarker:', e);
      }
      this.faceLandmarker = null;
    }
    this.isReady = false;
  }
}

export const faceDetectionService = new FaceDetectionService();
export default faceDetectionService;
