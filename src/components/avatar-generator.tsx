import { useCallback, useEffect, useRef, useState } from 'react';

import {
  buildDirectAvatarUrl,
  createRandomSeed,
  generateAvatarDataUri,
  getAvatarDownloadFilename,
} from '../avatar.ts';
import { runAvatarGenerationCycle } from './avatar-generation.ts';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export function AvatarGenerator() {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [seed, setSeed] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [glitchActive, setGlitchActive] = useState(false);
  const particleRef = useRef<number | null>(null);

  const colors = ['#ff6b9d', '#00f5d4', '#ffd93d', '#ff6b6b', '#c44dff'];

  const createParticles = useCallback((count = 30) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i += 1) {
      newParticles.push({
        x: Math.random() * 300,
        y: Math.random() * 300,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
      });
    }
    setParticles(newParticles);
  }, []);

  const updateParticles = useCallback(() => {
    setParticles((prev) =>
      prev
        .map((particle) => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          life: particle.life - 0.02,
          vy: particle.vy + 0.1,
        }))
        .filter((particle) => particle.life > 0),
    );
  }, []);

  useEffect(() => {
    if (particles.length > 0) {
      const animate = () => {
        updateParticles();
        particleRef.current = requestAnimationFrame(animate);
      };
      particleRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (particleRef.current !== null) {
        cancelAnimationFrame(particleRef.current);
      }
    };
  }, [particles.length, updateParticles]);

  const handleGenerate = useCallback(async (nextSeed?: string) => {
    await runAvatarGenerationCycle({
      nextSeed,
      createRandomSeed,
      generateAvatarDataUri,
      onStart: () => {
        setIsGenerating(true);
        setGlitchActive(true);
        createParticles(18);
      },
      onAvatarReady: (avatarDataUrl, resolvedSeed) => {
        setAvatar(avatarDataUrl);
        setSeed(resolvedSeed);
        setShowAvatar(false);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setShowAvatar(true);
          });
        });
        createParticles(50);
      },
      onFinish: () => {
        window.setTimeout(() => {
          setGlitchActive(false);
        }, 220);
        setIsGenerating(false);
      },
    });
  }, [createParticles]);

  useEffect(() => {
    const initialSeed = createRandomSeed();
    void handleGenerate(initialSeed);
  }, [handleGenerate]);

  const directLink = buildDirectAvatarUrl(seed || createRandomSeed());

  return (
    <div className="relative flex w-full max-w-[22rem] flex-col items-center md:max-w-none">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle, index) => (
          <div
            key={`${particle.x}-${particle.y}-${index}`}
            className="absolute rounded-full"
            style={{
              left: `calc(50% + ${particle.x - 150}px)`,
              top: `calc(50% + ${particle.y - 150}px)`,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity: particle.life,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
              transform: `scale(${particle.life})`,
            }}
          />
        ))}
      </div>

      <div
        className={`
          relative w-[15.5rem] h-[15.5rem] sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden
          bg-card border-2 border-primary/30
          shadow-[0_0_60px_-15px] shadow-primary/50
          transition-all duration-500
          ${glitchActive ? 'animate-glitch' : ''}
          ${showAvatar ? 'scale-100 opacity-100' : 'scale-90 opacity-50'}
        `}
      >
        <div className="absolute inset-0 pointer-events-none z-10 opacity-20 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.3)_2px,rgba(0,0,0,0.3)_4px)]" />

        <div
          className={`
            absolute inset-0 z-0
            bg-gradient-to-br from-primary/20 via-transparent to-accent/20
            ${showAvatar ? 'opacity-100' : 'opacity-0'}
            transition-opacity duration-700
          `}
        />

        {avatar && (
          <img
            src={avatar}
            alt="Generated pixel avatar"
            className={`
              w-full h-full object-contain p-4
              transition-all duration-700 ease-out
              [image-rendering:pixelated]
              ${showAvatar ? 'scale-100 rotate-0' : 'scale-150 rotate-12'}
            `}
          />
        )}

      </div>

      <div className="mt-6 flex w-full flex-col gap-3 items-stretch justify-center sm:mt-8 md:flex-row md:gap-4 md:items-center">
        <button
          onClick={() => void handleGenerate()}
          disabled={isGenerating}
          className={`
            w-full md:w-auto px-6 py-3.5 md:px-10 md:py-4 rounded-xl
            bg-primary text-primary-foreground font-bold text-lg
            relative overflow-hidden
            transition-all duration-300
            hover:scale-105 hover:shadow-[0_0_40px_-5px] hover:shadow-primary/70
            active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed
            group
          `}
        >
          <span
            className={`
              absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent
              translate-x-[-200%] group-hover:translate-x-[200%]
              transition-transform duration-700
            `}
          />
          <span className="relative z-10">
            Generate
          </span>
        </button>

        <a
          href={avatar ?? undefined}
          download={getAvatarDownloadFilename(seed || 'seed')}
          className={`
            w-full md:w-auto px-6 py-3.5 md:px-8 md:py-4 rounded-xl border border-primary/40 text-primary font-semibold text-base
            bg-background/40 backdrop-blur-sm transition-all duration-300
            hover:scale-105 hover:border-accent hover:text-accent hover:shadow-[0_0_32px_-8px] hover:shadow-accent/70
            ${avatar ? '' : 'pointer-events-none opacity-50'}
          `}
        >
          Download Avatar
        </a>
      </div>

      <a
        href={directLink}
        target="_blank"
        rel="noreferrer"
        className="mt-4 max-w-[22rem] text-center text-[11px] text-muted-foreground/75 underline underline-offset-4 hover:text-primary md:mt-6 md:max-w-xl md:text-xs"
      >
        <span className="md:hidden">Open direct SVG</span>
        <span className="hidden md:inline">Direct link: {directLink}</span>
      </a>
    </div>
  );
}
