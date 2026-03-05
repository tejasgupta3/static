'use client';

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle, useState } from 'react';
import { drawPhoto, drawJewelry, drawEarrings, computeNecklacePlacement, computeEarringPlacement } from '../lib/placement';

const JewelryRenderer = forwardRef(function JewelryRenderer(
  { photoEl, landmarks, selectedJewelry, width, height, onRenderComplete },
  ref
) {
  const canvasRef = useRef(null);
  const jewelryImgRef = useRef(null);
  const [jewelryLoaded, setJewelryLoaded] = useState(false);
  const [isRendering, setIsRendering] = useState(false);

  useImperativeHandle(ref, () => ({
    downloadImage(filename = 'lumiere-try-on.png') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    },
    getCanvas() { return canvasRef.current; },
  }));

  // Load jewelry image whenever selection changes
  useEffect(() => {
    if (!selectedJewelry?.image) {
      jewelryImgRef.current = null;
      setJewelryLoaded(false);
      return;
    }
    setJewelryLoaded(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { jewelryImgRef.current = img; setJewelryLoaded(true); };
    img.onerror = () => { jewelryImgRef.current = null; setJewelryLoaded(false); };
    img.src = selectedJewelry.image;
  }, [selectedJewelry?.image]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !photoEl) return;

    const ctx = canvas.getContext('2d');
    setIsRendering(true);

    // 1. Draw base photo
    drawPhoto(ctx, photoEl, width, height);

    // 2. Overlay jewelry
    if (landmarks && jewelryImgRef.current && jewelryLoaded) {
      const type = selectedJewelry?.placementType;

      if (type === 'earring') {
        const placement = computeEarringPlacement(landmarks);
        drawEarrings(ctx, jewelryImgRef.current, placement);
      } else {
        // Default: necklace
        const placement = computeNecklacePlacement(landmarks);
        drawJewelry(ctx, jewelryImgRef.current, placement);
      }
    }

    setIsRendering(false);
    onRenderComplete?.();
  }, [photoEl, landmarks, jewelryLoaded, selectedJewelry, width, height, onRenderComplete]);

  useEffect(() => { render(); }, [render]);

  const isEarring = selectedJewelry?.placementType === 'earring';

  return (
    <div className="canvas-container w-full h-full" style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
        aria-label="Jewelry try-on preview"
      />

      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-obsidian/30 backdrop-blur-sm">
          <div className="spinner" />
        </div>
      )}

      {photoEl && !landmarks && !isRendering && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none">
          <div className="bg-obsidian/80 border border-gold-600/30 px-4 py-2 rounded-sm text-center">
            <p className="float-label text-gold-400">
              No face detected — try a front-facing portrait
            </p>
          </div>
        </div>
      )}

      {/* Earring tip */}
      {photoEl && landmarks && isEarring && (
        <div className="absolute top-3 left-0 right-0 flex justify-center pointer-events-none">
          <div className="bg-obsidian/70 border border-gold-600/20 px-3 py-1.5 rounded-sm">
            <p className="float-label text-gold-400 text-center">
              Earrings placed at both ears
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

export default JewelryRenderer;
