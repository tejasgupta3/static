'use client';

import { useRef, useState, useCallback } from 'react';

/**
 * PhotoUploader
 * Handles drag-and-drop and click-to-upload portrait photos.
 * Calls onPhotoLoaded(imageDataUrl, imageElement) when ready.
 */
export default function PhotoUploader({ onPhotoLoaded, hasPhoto }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const processFile = useCallback(
    (file) => {
      if (!file) return;

      // Validate type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file (JPG, PNG, WEBP).');
        return;
      }

      // Validate size (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        setError('Image must be under 20MB.');
        return;
      }

      setError(null);
      setIsLoading(true);

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        const img = new Image();
        img.onload = () => {
          setIsLoading(false);
          onPhotoLoaded(dataUrl, img);
        };
        img.onerror = () => {
          setIsLoading(false);
          setError('Failed to load image. Please try another file.');
        };
        img.src = dataUrl;
      };
      reader.onerror = () => {
        setIsLoading(false);
        setError('Failed to read file.');
      };
      reader.readAsDataURL(file);
    },
    [onPhotoLoaded]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      processFile(file);
    },
    [processFile]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleChange = useCallback(
    (e) => {
      processFile(e.target.files[0]);
      e.target.value = '';
    },
    [processFile]
  );

  if (hasPhoto) {
    return (
      <button
        onClick={() => inputRef.current?.click()}
        className="btn-outline px-6 py-3 rounded-sm flex items-center gap-2"
        aria-label="Change photo"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        Change Photo
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      </button>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div
        className={`upload-zone w-full max-w-md aspect-[4/3] flex flex-col items-center justify-center gap-6 rounded-sm cursor-pointer relative ${isDragging ? 'drag-over' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        aria-label="Upload a portrait photo"
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="spinner" />
            <span className="float-label">Processing…</span>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full border border-gold-500/30 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d4922b" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>

            <div className="text-center space-y-2">
              <p className="font-display text-xl text-cream-dark font-light italic">
                Upload your portrait
              </p>
              <p className="float-label">
                Drag & drop or click to browse
              </p>
              <p className="text-obsidian-400 text-xs tracking-wide mt-1">
                JPG · PNG · WEBP · up to 20MB
              </p>
            </div>

            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <span className="float-label opacity-40">
                Best results with a front-facing portrait
              </span>
            </div>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
          aria-hidden="true"
        />
      </div>

      {error && (
        <p className="text-red-400 text-xs tracking-wide animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
}
