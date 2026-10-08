/**
 * Eye Aspect Ratio (EAR) Utilities
 * Calculates the eye openness ratio based on 3D facial landmarks from MediaPipe FaceLandmarker.
 * 
 * Formula:
 * EAR = (|p2 - p6| + |p3 - p5|) / (2 * |p1 - p4|)
 * 
 * Where:
 * - p1, p4 are the horizontal eye corners
 * - p2, p6 and p3, p5 are the vertical upper and lower eyelid points
 */

// MediaPipe 468/478 Face Mesh landmark indices for 6-point EAR calculation
export const LEFT_EYE_LANDMARKS = {
  p1: 33,   // Outer corner
  p2: 160,  // Upper eyelid (top-left)
  p3: 158,  // Upper eyelid (top-right)
  p4: 133,  // Inner corner
  p5: 153,  // Lower eyelid (bottom-right)
  p6: 144,  // Lower eyelid (bottom-left)
};

export const RIGHT_EYE_LANDMARKS = {
  p1: 362,  // Outer corner
  p2: 385,  // Upper eyelid (top-left)
  p3: 387,  // Upper eyelid (top-right)
  p4: 263,  // Inner corner
  p5: 373,  // Lower eyelid (bottom-right)
  p6: 380,  // Lower eyelid (bottom-left)
};

// Full eyelid contour for smooth canvas HUD rendering
export const LEFT_EYE_CONTOUR = [
  33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246, 33
];

export const RIGHT_EYE_CONTOUR = [
  362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398, 362
];

// Left & Right Eyebrow contours for HUD rendering
export const LEFT_EYEBROW = [70, 63, 105, 66, 107];
export const RIGHT_EYEBROW = [336, 296, 334, 293, 300];

// Iris landmarks (for MediaPipe models with refinement)
export const LEFT_IRIS = [468, 469, 470, 471, 472];
export const RIGHT_IRIS = [473, 474, 475, 476, 477];

/**
 * Calculates 2D Euclidean distance between two landmark points
 */
export function euclideanDistance(pointA, pointB) {
  if (!pointA || !pointB) return 0;
  const dx = pointA.x - pointB.x;
  const dy = pointA.y - pointB.y;
  return Math.hypot(dx, dy);
}

/**
 * Calculates the Eye Aspect Ratio (EAR) for a single eye given the full landmark array
 * @param {Array<{x: number, y: number, z?: number}>} landmarks 
 * @param {Object} indices 
 * @returns {number} EAR value (typically 0.25-0.40 open, <0.20 closed)
 */
export function calculateEAR(landmarks, indices) {
  if (!landmarks || landmarks.length === 0) return 0;

  const p1 = landmarks[indices.p1];
  const p2 = landmarks[indices.p2];
  const p3 = landmarks[indices.p3];
  const p4 = landmarks[indices.p4];
  const p5 = landmarks[indices.p5];
  const p6 = landmarks[indices.p6];

  if (!p1 || !p2 || !p3 || !p4 || !p5 || !p6) return 0;

  // Vertical distances
  const dVertical1 = euclideanDistance(p2, p6);
  const dVertical2 = euclideanDistance(p3, p5);

  // Horizontal distance
  const dHorizontal = euclideanDistance(p1, p4);

  if (dHorizontal === 0) return 0;

  const ear = (dVertical1 + dVertical2) / (2.0 * dHorizontal);
  return Number.isFinite(ear) ? Number(ear.toFixed(4)) : 0;
}

/**
 * Extract blink blendshapes if available from MediaPipe output
 * @param {Array} blendshapes 
 * @returns {{blinkLeft: number, blinkRight: number}}
 */
export function extractBlinkBlendshapes(blendshapes) {
  if (!blendshapes || !blendshapes[0] || !blendshapes[0].categories) {
    return { blinkLeft: null, blinkRight: null };
  }

  const categories = blendshapes[0].categories;
  let blinkLeft = null;
  let blinkRight = null;

  for (let i = 0; i < categories.length; i++) {
    if (categories[i].categoryName === 'eyeBlinkLeft') {
      blinkLeft = categories[i].score;
    } else if (categories[i].categoryName === 'eyeBlinkRight') {
      blinkRight = categories[i].score;
    }
  }

  return { blinkLeft, blinkRight };
}

/**
 * Determine if an eye is closed given EAR and optional blendshape score
 * @param {number} ear 
 * @param {number} threshold 
 * @param {number|null} blinkScore 
 * @returns {boolean}
 */
export function isEyeClosed(ear, threshold = 0.21, blinkScore = null) {
  // If high-accuracy blendshape is present, use joint evaluation
  if (blinkScore !== null && typeof blinkScore === 'number') {
    return blinkScore > 0.55 || ear < threshold;
  }
  return ear < threshold;
}
