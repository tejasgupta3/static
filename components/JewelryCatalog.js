'use client';

import { useRef, useState } from 'react';

export default function JewelryCatalog({ items = [], selectedId, onSelect }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };

  if (!items.length) return null;

  // Group by type for the header count
  const necklaces = items.filter(i => i.placementType === 'necklace').length;
  const earrings = items.filter(i => i.placementType === 'earring').length;

  return (
    <div className="relative w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4 px-1">
        <div className="gold-line flex-1" />
        <div className="flex items-center gap-3">
          <span className="float-label text-gold-400">Collection</span>
          <span className="text-obsidian-600 text-xs">·</span>
          <span className="float-label opacity-40">{necklaces} necklaces</span>
          <span className="text-obsidian-600 text-xs">·</span>
          <span className="float-label opacity-40">{earrings} earrings</span>
        </div>
        <div className="gold-line flex-1" />
      </div>

      {/* Scroll arrows */}
      {canScrollLeft && (
        <button onClick={() => scroll(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-obsidian/80 border border-obsidian-700 rounded-full text-gold-400 hover:border-gold-500 transition-colors"
          style={{ marginTop: '12px' }} aria-label="Scroll left">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
      )}
      {canScrollRight && (
        <button onClick={() => scroll(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-obsidian/80 border border-obsidian-700 rounded-full text-gold-400 hover:border-gold-500 transition-colors"
          style={{ marginTop: '12px' }} aria-label="Scroll right">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      )}

      {/* Scrollable row */}
      <div ref={scrollRef} onScroll={handleScroll}
        className="catalog-scroll flex gap-3 overflow-x-auto pb-2 px-1 scroll-smooth"
        style={{ scrollbarWidth: 'thin' }} role="listbox" aria-label="Jewelry catalog">
        {items.map((item, idx) => (
          <JewelryCard key={item.id} item={item} isSelected={item.id === selectedId} onSelect={onSelect} idx={idx} />
        ))}
      </div>

      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-obsidian-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-obsidian-950 to-transparent" />
    </div>
  );
}

function JewelryCard({ item, isSelected, onSelect, idx }) {
  const isEarring = item.placementType === 'earring';

  return (
    <button role="option" aria-selected={isSelected} onClick={() => onSelect(item)}
      className={`jewelry-card flex-shrink-0 w-40 rounded-sm border overflow-hidden cursor-pointer text-left ${
        isSelected ? 'active border-gold-500' : 'border-obsidian-700 hover:border-obsidian-500'
      }`}
      style={{ animationDelay: `${idx * 60}ms`, animation: 'slideUp 0.4s ease forwards', opacity: 0 }}>

      {/* Image */}
      <div className="w-full aspect-square bg-obsidian-900 relative overflow-hidden flex items-center justify-center">
        <img
          src={item.image}
          alt={item.name}
          className={`object-contain drop-shadow-lg ${isEarring ? 'w-1/2 h-3/4' : 'w-4/5 h-4/5'}`}
          loading="lazy"
        />

        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <span className="float-label px-1.5 py-0.5 rounded-sm"
            style={{ background: 'rgba(26,25,23,0.75)', color: isEarring ? '#e4ae3a' : '#d4922b', fontSize: '0.5rem' }}>
            {isEarring ? '◈ EARRING' : '◉ NECKLACE'}
          </span>
        </div>

        {/* Active check */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-gold-500 flex items-center justify-center">
            <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="#1a1917" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5 space-y-0.5">
        <p className="font-display text-sm text-cream-dark leading-tight italic">{item.name}</p>
        <p className="float-label opacity-60 block">{item.material}</p>
      </div>
    </button>
  );
}
