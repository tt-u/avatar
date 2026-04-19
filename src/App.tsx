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
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      <FloatingPixels />

      <div className="relative z-10 flex flex-col items-center">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight">
            <GlitchText text="PIXEL AVATAR" className="text-foreground" />
          </h1>
        </header>

        <AvatarGenerator />

        <footer className="fixed bottom-4 left-1/2 z-20 -translate-x-1/2 text-center text-sm text-muted-foreground/80">
          <p className="flex items-center justify-center gap-x-2 whitespace-nowrap rounded-full border border-primary/15 bg-background/50 px-4 py-2 backdrop-blur-sm">
            <span>BUILT WITH</span>
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
