import { generateAvatarFor } from '@bitmappunks/avatar-generator';

export function getSeedFromSearch(search, fallbackSeed = 'tt-u-avatar') {
  const params = new URLSearchParams(search);
  const seed = params.get('t')?.trim();

  return seed || fallbackSeed;
}

export async function generateAvatarDataUri(seed) {
  const avatar = await generateAvatarFor(seed);
  return avatar.svgBase64;
}

export async function renderAvatarPage({
  search = window.location.search,
  fallbackSeed = 'tt-u-avatar',
  mountNode = document.getElementById('app'),
} = {}) {
  if (!mountNode) {
    throw new Error('Missing #app mount node');
  }

  const seed = getSeedFromSearch(search, fallbackSeed);
  const dataUri = await generateAvatarDataUri(seed);

  const image = document.createElement('img');
  image.src = dataUri;
  image.alt = `Generated avatar for seed ${seed}`;
  image.width = 24;
  image.height = 24;

  mountNode.replaceChildren(image);

  return { seed, dataUri };
}
