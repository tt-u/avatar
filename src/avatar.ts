import { generateAvatarFor } from '@bitmappunks/avatar-generator';

export const DEFAULT_SEED = 'tt-u-avatar';

export function getSeedFromSearch(search: string, fallbackSeed = DEFAULT_SEED): string {
  const params = new URLSearchParams(search);
  const seed = params.get('t')?.trim();

  return seed || fallbackSeed;
}

export function createRandomSeed(
  now = Date.now(),
  randomValue = Math.random(),
): string {
  return `${now}-${Math.floor(randomValue * 1_000_000_000)}`;
}

export async function generateAvatarDataUri(seed: string): Promise<string> {
  const avatar = await generateAvatarFor(seed);
  return avatar.svgBase64;
}

export interface RenderAvatarElements {
  mountNode: HTMLElement;
  seedLabel: HTMLElement;
  randomButton: HTMLButtonElement;
}

export interface RenderAvatarPageOptions extends RenderAvatarElements {
  search?: string;
  fallbackSeed?: string;
}

export async function renderAvatarPage({
  search = window.location.search,
  fallbackSeed = createRandomSeed(),
  mountNode,
  seedLabel,
  randomButton,
}: RenderAvatarPageOptions): Promise<{ seed: string; dataUri: string }> {
  const initialSeed = getSeedFromSearch(search, fallbackSeed);

  const renderSeed = async (seed: string) => {
    const dataUri = await generateAvatarDataUri(seed);
    const image = document.createElement('img');

    image.src = dataUri;
    image.alt = `Generated avatar for seed ${seed}`;
    image.width = 24;
    image.height = 24;

    mountNode.replaceChildren(image);
    seedLabel.textContent = seed;

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('t', seed);
    window.history.replaceState({}, '', nextUrl);

    return { seed, dataUri };
  };

  randomButton.addEventListener('click', () => {
    randomButton.disabled = true;
    void renderSeed(createRandomSeed())
      .catch((error: unknown) => {
        console.error('Failed to generate random avatar', error);
        mountNode.textContent = 'Avatar generation failed.';
      })
      .finally(() => {
        randomButton.disabled = false;
      });
  });

  return renderSeed(initialSeed);
}
