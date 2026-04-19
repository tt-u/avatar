import { useEffect, useState } from 'react';

interface FloatingPixel {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

export function FloatingPixels() {
  const [pixels, setPixels] = useState<FloatingPixel[]>([]);

  useEffect(() => {
    const colors = ['var(--neon-pink)', 'var(--neon-cyan)', 'var(--neon-yellow)'];

    const newPixels: FloatingPixel[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }));

    setPixels(newPixels);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {pixels.map((pixel) => (
        <div
          key={pixel.id}
          className="absolute animate-float opacity-40"
          style={{
            left: `${pixel.x}%`,
            top: `${pixel.y}%`,
            width: pixel.size,
            height: pixel.size,
            backgroundColor: pixel.color,
            boxShadow: `0 0 ${pixel.size * 2}px ${pixel.color}`,
            animationDuration: `${pixel.duration}s`,
            animationDelay: `${pixel.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
