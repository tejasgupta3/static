/**
 * faceMesh.js
 * Handles MediaPipe FaceMesh initialization and landmark detection.
 * Runs entirely in the browser — no backend required.
 */

let faceMeshInstance = null;
let isInitializing = false;
let initCallbacks = [];

/**
 * Lazily initialize FaceMesh singleton.
 * Returns a promise that resolves when FaceMesh is ready.
 */
export async function getFaceMesh() {
  if (faceMeshInstance) return faceMeshInstance;

  if (isInitializing) {
    return new Promise((resolve, reject) => {
      initCallbacks.push({ resolve, reject });
    });
  }

  isInitializing = true;

  try {
    const { FaceMesh } = await import('@mediapipe/face_mesh');

    const fm = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}`,
    });

    fm.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    // Wrap onResults in a promise-friendly interface
    faceMeshInstance = fm;
    isInitializing = false;
    initCallbacks.forEach((cb) => cb.resolve(fm));
    initCallbacks = [];

    return fm;
  } catch (err) {
    isInitializing = false;
    initCallbacks.forEach((cb) => cb.reject(err));
    initCallbacks = [];
    throw err;
  }
}

/**
 * Detect face landmarks from an HTMLImageElement.
 * Returns the raw MediaPipe results object, or null if detection fails.
 *
 * @param {HTMLImageElement} imgEl
 * @returns {Promise<object|null>}
 */
export async function detectFaceLandmarks(imgEl) {
  const fm = await getFaceMesh();

  return new Promise((resolve) => {
    fm.onResults((results) => {
      resolve(results);
    });

    fm.send({ image: imgEl }).catch(() => resolve(null));
  });
}

/**
 * Extract the key landmark points we need for jewelry placement.
 * Returns null if no face was detected.
 *
 * Landmark indices (normalized 0–1):
 *   152 — chin tip
 *   234 — left jaw / left face edge
 *   454 — right jaw / right face edge
 *   132 — left ear area
 *   361 — right ear area
 *    10 — forehead top
 *
 * @param {object} results  MediaPipe results object
 * @param {number} canvasW  Canvas width in pixels
 * @param {number} canvasH  Canvas height in pixels
 * @returns {object|null}
 */
export function extractKeyLandmarks(results, canvasW, canvasH) {
  if (!results || !results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
    return null;
  }

  const lm = results.multiFaceLandmarks[0];

  const toPixel = (idx) => ({
    x: lm[idx].x * canvasW,
    y: lm[idx].y * canvasH,
    z: lm[idx].z,
  });

  return {
    chin: toPixel(152),
    leftJaw: toPixel(234),
    rightJaw: toPixel(454),
    leftEar: toPixel(132),
    rightEar: toPixel(361),
    foreheadTop: toPixel(10),
    // Additional reference points
    noseTip: toPixel(1),
    leftCheek: toPixel(50),
    rightCheek: toPixel(280),
  };
}
