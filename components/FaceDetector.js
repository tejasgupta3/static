'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { detectFaceLandmarks, extractKeyLandmarks } from '../lib/faceMesh';

/**
 * FaceDetector
 * Runs MediaPipe FaceMesh on a provided HTMLImageElement and exposes the
 * extracted landmark positions via the onLandmarksDetected callback.
 *
 * Props:
 *   photoEl         HTMLImageElement — the uploaded photo
 *   canvasWidth     number
 *   canvasHeight    number
 *   onLandmarksDetected(landmarks | null, transform)
 *   onDetecting(bool)
 */
export default function FaceDetector({
  photoEl,
  canvasWidth,
  canvasHeight,
  onLandmarksDetected,
  onDetecting,
}) {
  const runningRef = useRef(false);

  const runDetection = useCallback(async () => {
    if (!photoEl || runningRef.current) return;

    runningRef.current = true;
    onDetecting?.(true);

    try {
      // Create a temporary canvas the same size as the photo to feed MediaPipe
      // MediaPipe needs an image-like source; passing the img element directly works.
      const results = await detectFaceLandmarks(photoEl);

      // MediaPipe landmarks are normalized 0–1 to the *input image* dimensions.
      // We need to map them to canvas pixel space, accounting for letterboxing.

      // Compute letterbox transform (same logic as drawPhoto in placement.js)
      const imgAspect = photoEl.naturalWidth / photoEl.naturalHeight;
      const canvasAspect = canvasWidth / canvasHeight;

      let drawW, drawH, offsetX, offsetY;
      if (imgAspect > canvasAspect) {
        drawW = canvasWidth;
        drawH = canvasWidth / imgAspect;
        offsetX = 0;
        offsetY = (canvasHeight - drawH) / 2;
      } else {
        drawH = canvasHeight;
        drawW = canvasHeight * imgAspect;
        offsetX = (canvasWidth - drawW) / 2;
        offsetY = 0;
      }

      const transform = { scale: drawW / photoEl.naturalWidth, offsetX, offsetY, drawW, drawH };

      if (!results || !results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
        onLandmarksDetected(null, transform);
        return;
      }

      // extractKeyLandmarks uses canvasW × canvasH as multiplier.
      // But the image only fills a sub-region — so we pass drawW/drawH
      // and then add the letterbox offset manually.
      const rawLandmarks = extractKeyLandmarks(results, drawW, drawH);

      if (!rawLandmarks) {
        onLandmarksDetected(null, transform);
        return;
      }

      // Shift every point by the letterbox offset
      const shiftedLandmarks = Object.fromEntries(
        Object.entries(rawLandmarks).map(([key, pt]) => [
          key,
          { ...pt, x: pt.x + offsetX, y: pt.y + offsetY },
        ])
      );

      onLandmarksDetected(shiftedLandmarks, transform);
    } catch (err) {
      console.error('Face detection error:', err);
      onLandmarksDetected(null, null);
    } finally {
      runningRef.current = false;
      onDetecting?.(false);
    }
  }, [photoEl, canvasWidth, canvasHeight, onLandmarksDetected, onDetecting]);

  // Re-run whenever the photo changes
  useEffect(() => {
    if (photoEl) {
      runDetection();
    }
  }, [photoEl, runDetection]);

  // This component has no visual output — it's a logic-only wrapper
  return null;
}
