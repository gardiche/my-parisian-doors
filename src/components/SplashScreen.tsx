import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [slideX, setSlideX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [completed, setCompleted] = useState(false);
  const startXRef = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const TRACK_PADDING = 4;
  const THUMB_SIZE = 52;

  const getTrackWidth = () => (trackRef.current?.offsetWidth ?? 280) - THUMB_SIZE - TRACK_PADDING * 2;
  const maxSlide = getTrackWidth();
  const progress = Math.min(slideX / maxSlide, 1);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (completed) return;
    setIsDragging(true);
    startXRef.current = e.clientX - slideX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const newX = Math.max(0, Math.min(e.clientX - startXRef.current, maxSlide));
    setSlideX(newX);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (progress >= 0.88) {
      setSlideX(maxSlide);
      setCompleted(true);
      setTimeout(onFinish, 400);
    } else {
      // Spring back
      setSlideX(0);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Background image */}
      <img
        src="/loading.png"
        alt="Paris"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient overlay — dark at bottom, subtle at top */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end px-6 pb-16">
        {/* Text */}
        <div className="mb-10">
          <h1 className="font-calligraphy text-5xl font-semibold text-white leading-tight mb-4">
            Explore Paris,<br />
            <span className="italic">one door at a time</span>
          </h1>
          <p className="text-white/70 text-sm leading-relaxed max-w-xs">
            Wander through the streets of Paris from your phone. Discover hidden gems and iconic doors captured by passionate explorers.
          </p>
        </div>

        {/* Slide to explore */}
        <div
          ref={trackRef}
          className="relative flex items-center h-16 rounded-full px-1"
          style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          {/* Label */}
          <span
            className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white/80 select-none pointer-events-none transition-opacity duration-200"
            style={{ opacity: 1 - progress * 1.5 }}
          >
            Explore Paris →
          </span>

          {/* Completion label */}
          <span
            className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white select-none pointer-events-none transition-opacity duration-300"
            style={{ opacity: progress >= 0.88 ? 1 : 0 }}
          >
            Let's go ✦
          </span>

          {/* Thumb */}
          <div
            className={cn(
              "relative z-10 flex items-center justify-center rounded-full cursor-grab active:cursor-grabbing select-none transition-transform",
              completed && "scale-110"
            )}
            style={{
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              background: completed ? '#A6473C' : '#2E4A62',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              transform: `translateX(${slideX}px)`,
              transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s',
              flexShrink: 0,
              marginLeft: TRACK_PADDING,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {completed ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L20 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
