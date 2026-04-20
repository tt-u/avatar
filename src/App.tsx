import { useEffect, useState } from 'react';

import { generateAvatarDataUri, getSeedFromSearch, isDirectAvatarRequest } from './avatar.ts';
import { AvatarGenerator } from './components/avatar-generator.tsx';
import { FloatingPixels } from './components/floating-pixels.tsx';
import { GlitchText } from './components/glitch-text.tsx';

function DirectAvatarPage() {
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    const seed = getSeedFromSearch(window.location.search);
    void generateAvatarDataUri(seed).then((dataUri) => {
      document.body.classList.add('direct-avatar-mode');
      document.title = `Avatar ${seed}`;
      setAvatar(dataUri);
    });

    return () => {
      document.body.classList.remove('direct-avatar-mode');
    };
  }, []);

  return avatar ? <img src={avatar} alt="Generated avatar" /> : null;
}

function RootPage() {
  useEffect(() => {
    document.body.classList.remove('direct-avatar-mode');
    document.title = 'Pixel Avatar Generator';
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-8 sm:py-12">
      <FloatingPixels />

      <div className="relative z-10 flex flex-col items-center">
        <header className="mb-8 text-center sm:mb-12">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-6xl lg:text-7xl">
            <GlitchText text="PIXEL AVATAR" className="text-foreground" />
          </h1>
        </header>

        <AvatarGenerator />

        <footer className="fixed bottom-3 left-1/2 z-20 -translate-x-1/2 text-center text-[10px] text-muted-foreground/65 sm:bottom-4 sm:text-sm sm:text-muted-foreground/80">
          <p className="flex max-w-[calc(100vw-1.5rem)] flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 rounded-full border border-primary/10 bg-background/35 px-3 py-1.5 backdrop-blur-sm sm:flex-nowrap sm:gap-x-2 sm:border-primary/15 sm:bg-background/50 sm:px-4 sm:py-2">
            <span className="hidden sm:inline">BUILT WITH</span>
            <a
              href="https://www.npmjs.com/package/@bitmappunks/avatar-generator"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:text-accent underline underline-offset-4"
            >
              @bitmappunks/avatar-generator
            </a>
          </p>
        </footer>
      </div>

      <div className="fixed top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[150px] translate-x-1/2 translate-y-1/2 pointer-events-none" />
    </main>
  );
}

export default function App() {
  return isDirectAvatarRequest(window.location.search) ? <DirectAvatarPage /> : <RootPage />;
}
