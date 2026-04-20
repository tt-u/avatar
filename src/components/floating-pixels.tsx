import { useEffect, useRef, useState, type CSSProperties } from 'react';

import { createRandomSeed, generateAvatarDataUri } from '../avatar.ts';

const BITMAP_COUNT = 40;
const MIN_BITMAP_SIZE = 24;
const MAX_BITMAP_SIZE = 64;
const POSITION_CANDIDATES = 14;

interface FloatingBitmap {
  id: number;
  x: number;
  y: number;
  size: number;
  src: string;
  driftFromX: number;
  driftFromY: number;
  driftToX: number;
  driftToY: number;
  settleX: number;
  settleY: number;
  angle: number;
  rotateSwing: number;
  scaleLow: number;
  scaleHigh: number;
  hue: number;
  opacityLow: number;
  opacityHigh: number;
  duration: number;
  fadeDuration: number;
  fadeDelay: number;
  delay: number;
  refreshing: boolean;
}

export function FloatingPixels() {
  const [bitmaps, setBitmaps] = useState<FloatingBitmap[]>([]);
  const bitmapsRef = useRef<FloatingBitmap[]>([]);

  useEffect(() => {
    bitmapsRef.current = bitmaps;
  }, [bitmaps]);

  useEffect(() => {
    let active = true;
    const refreshTimers = new Set<number>();

    const createCandidate = () => ({
      x: Math.random() * 108 - 4,
      y: Math.random() * 108 - 4,
    });

    const getDistanceScore = (
      candidate: { x: number; y: number },
      positions: Array<{ x: number; y: number }>,
    ) => {
      if (positions.length === 0) {
        return Number.POSITIVE_INFINITY;
      }

      return Math.min(
        ...positions.map((position) => {
          const x = candidate.x - position.x;
          const y = candidate.y - position.y;
          return Math.hypot(x, y);
        }),
      );
    };

    const createOrganicPositions = (count: number) => {
      const positions: Array<{ x: number; y: number }> = [];

      for (let index = 0; index < count; index += 1) {
        const candidates = Array.from({ length: POSITION_CANDIDATES }, createCandidate);
        const bestCandidate = candidates.reduce((best, candidate) =>
          getDistanceScore(candidate, positions) > getDistanceScore(best, positions)
            ? candidate
            : best,
        );

        positions.push(bestCandidate);
      }

      return positions;
    };

    const positions = createOrganicPositions(BITMAP_COUNT);

    const createBitmap = async (id: number): Promise<FloatingBitmap> => {
      const seed = `bg-bmp-${id}-${createRandomSeed()}`;
      const src = await generateAvatarDataUri(seed);
      const driftX = (Math.random() - 0.5) * 56;
      const driftY = (Math.random() - 0.5) * 48;
      const angle = Math.random() * 156 - 78;
      const position = positions[id] ?? createCandidate();

      return {
        id,
        x: position.x,
        y: position.y,
        size: Math.random() * (MAX_BITMAP_SIZE - MIN_BITMAP_SIZE) + MIN_BITMAP_SIZE,
        src,
        driftFromX: driftX * -0.5,
        driftFromY: driftY * -0.5,
        driftToX: driftX * 0.5,
        driftToY: driftY * 0.5,
        settleX: driftX * 0.7,
        settleY: driftY * 0.7,
        angle,
        rotateSwing: Math.random() * 7 + 3,
        scaleLow: Math.random() * 0.08 + 0.9,
        scaleHigh: Math.random() * 0.1 + 1.02,
        hue: Math.random() * 70 - 35,
        opacityLow: 0.2,
        opacityHigh: 0.75,
        duration: Math.random() * 18 + 22,
        fadeDuration: Math.random() * 3.4 + 5.2,
        delay: Math.random() * -22,
        fadeDelay: Math.random() * -7,
        refreshing: false,
      };
    };

    const replaceBitmaps = async (ids: number[]) => {
      const replacements = await Promise.all(ids.map((id) => createBitmap(id)));

      if (!active) {
        return;
      }

      setBitmaps((current) =>
        current.map((bitmap) => {
          const replacement = replacements.find((item) => item.id === bitmap.id);
          return replacement ?? bitmap;
        }),
      );
    };

    void Promise.all(Array.from({ length: BITMAP_COUNT }, (_, index) => createBitmap(index))).then(
      (newBitmaps) => {
        if (active) {
          setBitmaps(newBitmaps);
        }
      },
    );

    const interval = window.setInterval(() => {
      const current = bitmapsRef.current;
      if (current.length === 0) {
        return;
      }

      const shuffledIds = [...current]
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 3) + 2)
        .map((bitmap) => bitmap.id);

      setBitmaps((existing) =>
        existing.map((bitmap) =>
          shuffledIds.includes(bitmap.id) ? { ...bitmap, refreshing: true } : bitmap,
        ),
      );

      const refreshTimer = window.setTimeout(() => {
        void replaceBitmaps(shuffledIds);
        refreshTimers.delete(refreshTimer);
      }, 760);

      refreshTimers.add(refreshTimer);
    }, 2600);

    return () => {
      active = false;
      window.clearInterval(interval);
      refreshTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <div className="bitmap-field fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="bitmap-scanline" />
      {bitmaps.map((bitmap) => (
        <div
          key={bitmap.id}
          className="bitmap-sprite"
          style={{
            '--bmp-drift-from-x': `${bitmap.driftFromX}px`,
            '--bmp-drift-from-y': `${bitmap.driftFromY}px`,
            '--bmp-drift-to-x': `${bitmap.driftToX}px`,
            '--bmp-drift-to-y': `${bitmap.driftToY}px`,
            '--bmp-settle-x': `${bitmap.settleX}px`,
            '--bmp-settle-y': `${bitmap.settleY}px`,
            '--bmp-angle': `${bitmap.angle}deg`,
            '--bmp-rotate-swing': `${bitmap.rotateSwing}deg`,
            '--bmp-scale-low': bitmap.scaleLow,
            '--bmp-scale-high': bitmap.scaleHigh,
            '--bmp-duration': `${bitmap.duration}s`,
            '--bmp-fade-duration': `${bitmap.fadeDuration}s`,
            '--bmp-delay': `${bitmap.delay}s`,
            '--bmp-fade-delay': `${bitmap.fadeDelay}s`,
            '--bmp-opacity-low': bitmap.opacityLow,
            '--bmp-opacity-high': bitmap.opacityHigh,
            left: `${bitmap.x}%`,
            top: `${bitmap.y}%`,
            width: `${bitmap.size}px`,
            height: `${bitmap.size}px`,
          } as CSSProperties}
        >
          <div className={`bitmap-sprite-fader ${bitmap.refreshing ? 'bitmap-sprite-fader-refreshing' : ''}`}>
            <img
              src={bitmap.src}
              alt=""
              aria-hidden="true"
              className="bitmap-sprite-image"
              style={{
                filter: `hue-rotate(${bitmap.hue}deg) saturate(1.18) contrast(1.08)`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
