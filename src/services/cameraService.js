/**
 * Camera Service
 * Manages webcam access, device enumeration, video streams, and track lifecycle.
 */

class CameraService {
  constructor() {
    this.stream = null;
    this.currentDeviceId = null;
  }

  /**
   * Get list of connected video input devices
   * @returns {Promise<Array<{deviceId: string, label: string}>>}
   */
  async getAvailableCameras() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return [];
      }
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      return videoDevices.map((d, idx) => ({
        deviceId: d.deviceId,
        label: d.label || `Camera ${idx + 1}`
      }));
    } catch (err) {
      console.warn('Unable to enumerate cameras:', err);
      return [];
    }
  }

  /**
   * Request webcam stream with specified deviceId and constraints
   * @param {string} [deviceId] 
   * @param {Object} [customConstraints] 
   * @returns {Promise<MediaStream>}
   */
  async startCamera(deviceId = null, customConstraints = {}) {
    this.stopCamera();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Webcam API is not supported in this browser or context.');
    }

    const videoConstraints = {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: 'user',
      ...customConstraints
    };

    if (deviceId) {
      videoConstraints.deviceId = { exact: deviceId };
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false
      });
      this.currentDeviceId = deviceId;
      return this.stream;
    } catch (err) {
      let message = 'Failed to access camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera permission was denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No camera device found on this system.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = 'Camera is already in use by another application or tab.';
      } else if (err.name === 'OverconstrainedError') {
        message = 'Camera constraints cannot be satisfied. Trying default camera...';
        // Retry with default
        return this.startCamera(null);
      }
      const error = new Error(message);
      error.originalError = err;
      throw error;
    }
  }

  /**
   * Stop all active media tracks cleanly
   */
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping track', e);
        }
      });
      this.stream = null;
    }
  }

  /**
   * Check if stream is currently active
   * @returns {boolean}
   */
  isActive() {
    return Boolean(this.stream && this.stream.active && this.stream.getVideoTracks().some(t => t.readyState === 'live'));
  }
}

export const cameraService = new CameraService();
export default cameraService;
