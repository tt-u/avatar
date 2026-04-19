import { useEffect, useState } from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
}

export function GlitchText({ text, className = '' }: GlitchTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    let interval: ReturnType<typeof setInterval> | undefined;

    const triggerGlitch = () => {
      setIsGlitching(true);
      let iterations = 0;
      const maxIterations = 10;

      interval = setInterval(() => {
        setDisplayText(
          text
            .split('')
            .map((char, index) => {
              if (index < iterations) {
                return text[index];
              }
              if (char === ' ') {
                return ' ';
              }
              return glitchChars[Math.floor(Math.random() * glitchChars.length)];
            })
            .join(''),
        );

        iterations += 1;
        if (iterations > maxIterations && interval) {
          clearInterval(interval);
          setDisplayText(text);
          setIsGlitching(false);
        }
      }, 50);
    };

    triggerGlitch();

    const randomGlitch = setInterval(() => {
      if (Math.random() > 0.7) {
        triggerGlitch();
      }
    }, 3000);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
      clearInterval(randomGlitch);
    };
  }, [text]);

  return (
    <span className={`relative inline-block ${className}`} data-text={text}>
      <span className={`relative z-10 ${isGlitching ? 'animate-glitch-text' : ''}`}>
        {displayText}
      </span>
      <span
        className="absolute top-0 left-0 -translate-x-[2px] text-neon-cyan opacity-70 z-0"
        aria-hidden="true"
      >
        {displayText}
      </span>
      <span
        className="absolute top-0 left-0 translate-x-[2px] text-neon-pink opacity-70 z-0"
        aria-hidden="true"
      >
        {displayText}
      </span>
    </span>
  );
}
