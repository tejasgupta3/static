'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import PhotoUploader from '../components/PhotoUploader';
import FaceDetector from '../components/FaceDetector';
import JewelryRenderer from '../components/JewelryRenderer';
import JewelryCatalog from '../components/JewelryCatalog';
import catalog from '../data/catalog.json';

// Canvas dimensions — the "virtual" resolution we render at
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 1100;

export default function Home() {
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [photoEl, setPhotoEl] = useState(null);
  const [landmarks, setLandmarks] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [selectedJewelry, setSelectedJewelry] = useState(catalog[0] || null);
  const [detectionError, setDetectionError] = useState(false);

  const rendererRef = useRef(null);

  const handlePhotoLoaded = useCallback((dataUrl, imgEl) => {
    setPhotoDataUrl(dataUrl);
    setPhotoEl(imgEl);
    setLandmarks(null);
    setDetectionError(false);
  }, []);

  const handleLandmarksDetected = useCallback((lm, transform) => {
    setLandmarks(lm);
    setDetectionError(!lm);
  }, []);

  const handleReset = useCallback(() => {
    setPhotoDataUrl(null);
    setPhotoEl(null);
    setLandmarks(null);
    setDetectionError(false);
    setSelectedJewelry(catalog[0] || null);
  }, []);

  const handleDownload = useCallback(() => {
    rendererRef.current?.downloadImage('lumiere-jewelry-try-on.png');
  }, []);

  return (
    <div className="grain min-h-screen bg-obsidian-950 flex flex-col" style={{ fontFamily: 'var(--font-body)' }}>
      {/* Ambient background */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(212,146,43,0.07) 0%, transparent 70%), ' +
            'radial-gradient(ellipse 60% 40% at 80% 100%, rgba(212,146,43,0.04) 0%, transparent 70%)',
        }}
      />

      {/* ── HEADER ──────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-obsidian-800">
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="flex-shrink-0">
            <circle cx="14" cy="14" r="12" stroke="#d4922b" strokeWidth="0.75" />
            <path d="M 7 17 Q 14 8 21 17" stroke="#d4922b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <ellipse cx="14" cy="19" rx="3" ry="2.5" fill="#d4922b" opacity="0.9" />
          </svg>
          <div>
            <h1 className="gold-shimmer font-display text-2xl font-light tracking-widest">
              Lumière
            </h1>
            <p className="float-label opacity-50" style={{ marginTop: '-2px' }}>
              Jewelry Try-On
            </p>
          </div>
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-3">
          {photoEl && (
            <>
              <PhotoUploader onPhotoLoaded={handlePhotoLoaded} hasPhoto />

              <button
                onClick={handleReset}
                className="btn-outline px-5 py-3 rounded-sm flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 .49-4.5" />
                </svg>
                Reset
              </button>

              <button
                onClick={handleDownload}
                className="btn-gold px-5 py-3 rounded-sm flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download
              </button>
            </>
          )}
        </div>
      </header>

      {/* ── MAIN ────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col">
        {!photoEl ? (
          /* ── Upload State ── */
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 animate-fade-in">
            <div className="mb-10 text-center space-y-3">
              <p className="font-display text-5xl font-light italic text-cream leading-tight">
                Try Before You Buy
              </p>
              <p className="text-obsidian-400 text-sm tracking-widest uppercase">
                Upload a portrait · Select a design · Download your look
              </p>
            </div>

            <div className="gold-line w-24 mx-auto mb-10" />

            <PhotoUploader onPhotoLoaded={handlePhotoLoaded} hasPhoto={false} />

            {/* Feature pills */}
            <div className="mt-12 flex flex-wrap gap-3 justify-center">
              {[
                { icon: '✦', label: 'AI Face Detection' },
                { icon: '◈', label: 'Instant Preview' },
                { icon: '⬡', label: 'No Data Stored' },
                { icon: '⟁', label: 'HD Download' },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-obsidian-700 text-obsidian-400 text-xs tracking-wider"
                >
                  <span className="text-gold-500 text-xs">{f.icon}</span>
                  {f.label}
                </div>
              ))}
            </div>

            {/* Catalog preview strip */}
            <div className="mt-14 w-full max-w-lg">
              <p className="float-label text-center mb-4 opacity-40">Featured Pieces</p>
              <div className="flex gap-3 justify-center overflow-hidden">
                {catalog.slice(0, 4).map((item, i) => (
                  <div
                    key={item.id}
                    className="w-20 h-20 rounded-sm border border-obsidian-800 bg-obsidian-900 flex items-center justify-center opacity-50"
                    style={{ animationDelay: `${i * 80}ms`, animation: 'slideUp 0.5s ease forwards' }}
                  >
                    <img
                      src={item.image}
                      alt=""
                      className="w-12 h-12 object-contain opacity-60"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ── Try-On State ── */
          <div className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden animate-fade-in">
            {/* Left sidebar — info panel */}
            <aside className="hidden lg:flex flex-col w-64 xl:w-72 border-r border-obsidian-800 p-6 shrink-0 gap-6">
              <StatusPanel
                isDetecting={isDetecting}
                detectionError={detectionError}
                landmarks={landmarks}
                selectedJewelry={selectedJewelry}
              />
            </aside>

            {/* Center — canvas */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
                <div
                  className="w-full max-w-xl relative shadow-2xl"
                  style={{
                    aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
                    boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,146,43,0.1)',
                  }}
                >
                  <JewelryRenderer
                    ref={rendererRef}
                    photoEl={photoEl}
                    landmarks={landmarks}
                    selectedJewelry={selectedJewelry}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                  />

                  {/* Detecting overlay */}
                  {isDetecting && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-obsidian/60 backdrop-blur-sm rounded-sm animate-fade-in">
                      <div className="spinner mb-3" />
                      <p className="float-label text-gold-400">Detecting face…</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom catalog strip */}
              <div className="border-t border-obsidian-800 px-4 lg:px-8 py-5">
                {/* Mobile status */}
                <div className="lg:hidden mb-4">
                  <MobileStatusBar
                    isDetecting={isDetecting}
                    detectionError={detectionError}
                    landmarks={landmarks}
                    selectedJewelry={selectedJewelry}
                  />
                </div>

                <JewelryCatalog
                  items={catalog}
                  selectedId={selectedJewelry?.id}
                  onSelect={setSelectedJewelry}
                />
              </div>
            </div>

            {/* Right sidebar — download */}
            <aside className="hidden lg:flex flex-col w-52 xl:w-60 border-l border-obsidian-800 p-6 shrink-0 gap-4 justify-end">
              <div className="space-y-3">
                <button
                  onClick={handleDownload}
                  className="btn-gold w-full py-3 rounded-sm flex items-center justify-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download
                </button>
                <button
                  onClick={handleReset}
                  className="btn-outline w-full py-3 rounded-sm"
                >
                  Reset
                </button>
              </div>

              <div className="gold-line" />

              <p className="text-obsidian-500 text-xs tracking-wider leading-relaxed text-center">
                Photos are processed locally. No data leaves your device.
              </p>
            </aside>
          </div>
        )}
      </main>

      {/* Face Detector (logic-only, no DOM) */}
      {photoEl && (
        <FaceDetector
          photoEl={photoEl}
          canvasWidth={CANVAS_WIDTH}
          canvasHeight={CANVAS_HEIGHT}
          onLandmarksDetected={handleLandmarksDetected}
          onDetecting={setIsDetecting}
        />
      )}
    </div>
  );
}

/* ── Sub-components ──────────────────────────────── */

function StatusPanel({ isDetecting, detectionError, landmarks, selectedJewelry }) {
  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <p className="float-label mb-3">Detection Status</p>
        <div className="space-y-2">
          <StatusRow
            label="Face"
            value={isDetecting ? 'Scanning…' : landmarks ? 'Detected ✓' : 'Not found'}
            ok={!!landmarks}
            loading={isDetecting}
          />
          <StatusRow
            label="Landmarks"
            value={landmarks ? '9 points mapped' : '—'}
            ok={!!landmarks}
          />
        </div>
      </div>

      {detectionError && (
        <div className="border border-gold-700/30 bg-gold-900/10 rounded-sm p-3">
          <p className="float-label text-gold-500 mb-1">Tip</p>
          <p className="text-obsidian-300 text-xs leading-relaxed">
            For best results, use a well-lit front-facing portrait with a clear view of the neck and shoulders.
          </p>
        </div>
      )}

      {selectedJewelry && (
        <div className="space-y-2">
          <div className="gold-line" />
          <p className="float-label mb-2">Selected Piece</p>
          <p className="font-display text-lg italic text-cream-dark">{selectedJewelry.name}</p>
          <p className="float-label opacity-60">{selectedJewelry.material}</p>
          <p className="text-obsidian-400 text-xs leading-relaxed mt-2">{selectedJewelry.description}</p>
        </div>
      )}
    </div>
  );
}

function StatusRow({ label, value, ok, loading }) {
  return (
    <div className="flex items-center justify-between">
      <span className="float-label opacity-50">{label}</span>
      <span
        className={`text-xs tracking-wide ${
          loading ? 'text-gold-400' : ok ? 'text-green-400' : 'text-obsidian-500'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function MobileStatusBar({ isDetecting, detectionError, landmarks, selectedJewelry }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-2">
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            isDetecting ? 'bg-gold-400 animate-pulse' : landmarks ? 'bg-green-400' : 'bg-obsidian-600'
          }`}
        />
        <span className="text-obsidian-400 tracking-wide">
          {isDetecting ? 'Detecting…' : landmarks ? 'Face detected' : 'No face found'}
        </span>
      </div>
      {selectedJewelry && (
        <span className="font-display italic text-gold-400 text-sm">{selectedJewelry.name}</span>
      )}
    </div>
  );
}
