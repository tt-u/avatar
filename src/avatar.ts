import { generateAvatarFor } from '@bitmappunks/avatar-generator';

export const DEFAULT_SEED = 'tt-u-avatar';

export function getSeedFromSearch(search: string, fallbackSeed = DEFAULT_SEED): string {
  const params = new URLSearchParams(search);
  const seed = params.get('t')?.trim();

  return seed || fallbackSeed;
}

export function isDirectAvatarRequest(search: string): boolean {
  const params = new URLSearchParams(search);
  return Boolean(params.get('t')?.trim());
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

function createAvatarImage(seed: string, dataUri: string): HTMLImageElement {
  const image = document.createElement('img');

  image.src = dataUri;
  image.alt = `Generated avatar for seed ${seed}`;
  image.width = 24;
  image.height = 24;
  image.className = 'avatar-pop';

  return image;
}

function replaceUrlSeed(seed: string): void {
  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set('t', seed);
  window.history.replaceState({}, '', nextUrl);
}

function triggerGenerationEffects(
  avatarCard: HTMLElement,
  randomButton: HTMLButtonElement,
  burstContainer: HTMLElement,
): void {
  avatarCard.classList.remove('is-generating');
  randomButton.classList.remove('is-bursting');
  void avatarCard.offsetWidth;

  avatarCard.classList.add('is-generating');
  randomButton.classList.add('is-bursting');
  burstContainer.replaceChildren();

  for (let index = 0; index < 14; index += 1) {
    const spark = document.createElement('span');
    const angle = (Math.PI * 2 * index) / 14;
    const distance = 24 + Math.random() * 44;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    spark.className = 'button-spark';
    spark.style.setProperty('--spark-x', `${x}px`);
    spark.style.setProperty('--spark-y', `${y}px`);
    spark.style.setProperty('--spark-delay', `${index * 24}ms`);
    burstContainer.appendChild(spark);
  }

  window.setTimeout(() => {
    avatarCard.classList.remove('is-generating');
    randomButton.classList.remove('is-bursting');
    burstContainer.replaceChildren();
  }, 820);
}

export interface RenderAvatarElements {
  mountNode: HTMLElement;
  seedLabel: HTMLElement;
  randomButton: HTMLButtonElement;
  avatarCard: HTMLElement;
  burstContainer: HTMLElement;
}

export interface RenderAvatarPageOptions extends RenderAvatarElements {
  search?: string;
  fallbackSeed?: string;
}

export async function renderAvatarInto(
  mountNode: HTMLElement,
  seed: string,
): Promise<{ seed: string; dataUri: string }> {
  const dataUri = await generateAvatarDataUri(seed);
  const image = createAvatarImage(seed, dataUri);

  mountNode.replaceChildren(image);

  return { seed, dataUri };
}

export async function renderAvatarPage({
  search = window.location.search,
  fallbackSeed = createRandomSeed(),
  mountNode,
  seedLabel,
  randomButton,
  avatarCard,
  burstContainer,
}: RenderAvatarPageOptions): Promise<{ seed: string; dataUri: string }> {
  const initialSeed = getSeedFromSearch(search, fallbackSeed);

  const renderSeed = async (seed: string, updateUrl = true) => {
    const result = await renderAvatarInto(mountNode, seed);
    seedLabel.textContent = seed;

    if (updateUrl) {
      replaceUrlSeed(seed);
    }

    return result;
  };

  randomButton.addEventListener('click', () => {
    randomButton.disabled = true;
    triggerGenerationEffects(avatarCard, randomButton, burstContainer);

    void renderSeed(createRandomSeed())
      .catch((error: unknown) => {
        console.error('Failed to generate random avatar', error);
        mountNode.textContent = 'Avatar generation failed.';
      })
      .finally(() => {
        randomButton.disabled = false;
      });
  });

  return renderSeed(initialSeed, false);
}

export async function renderDirectAvatarPage({
  search = window.location.search,
  fallbackSeed = DEFAULT_SEED,
}: {
  search?: string;
  fallbackSeed?: string;
} = {}): Promise<{ seed: string; dataUri: string }> {
  const seed = getSeedFromSearch(search, fallbackSeed);
  const dataUri = await generateAvatarDataUri(seed);
  const image = createAvatarImage(seed, dataUri);

  document.body.className = 'direct-avatar-mode';
  document.body.replaceChildren(image);
  document.title = `Avatar ${seed}`;

  return { seed, dataUri };
}
