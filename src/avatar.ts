import { generateAvatarFor } from '@bitmappunks/avatar-generator';

export const DEFAULT_SEED = 'tt-u-avatar';

export interface AvatarGeneratorResult {
  svgBase64: string;
}

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

export function extractAvatarDataUri(result: AvatarGeneratorResult): string {
  return result.svgBase64;
}

export function getAvatarDownloadFilename(seed: string): string {
  const normalized = seed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'seed';

  return `avatar-${normalized}.svg`;
}

export function buildDirectAvatarUrl(seed: string): string {
  return `https://bmp.blockinsight.top/?t=${encodeURIComponent(seed)}`;
}

export async function generateAvatarDataUri(seed: string): Promise<string> {
  const avatar = await generateAvatarFor(seed);
  return extractAvatarDataUri(avatar);
}
