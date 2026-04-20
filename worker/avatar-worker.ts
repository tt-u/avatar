const DATA_URI_PREFIX = 'data:image/svg+xml;base64,';
const DEFAULT_SEED = 'tt-u-avatar';

export interface AvatarGeneratorResult {
  svgBase64: string;
}

export interface CreateAvatarWorkerResponseOptions {
  request: Request;
  assetsFetch: (request: Request) => Promise<Response>;
  generateAvatarFor: (seed: string) => Promise<AvatarGeneratorResult>;
}

export function decodeSvgDataUriToUtf8(dataUri: string): string {
  if (!dataUri.startsWith(DATA_URI_PREFIX)) {
    throw new Error('Expected an SVG data URI');
  }

  const base64 = dataUri.slice(DATA_URI_PREFIX.length);
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

export function isDirectAvatarAssetRequest(request: Request): boolean {
  const url = new URL(request.url);
  const seed = url.searchParams.get('t')?.trim();
  const lastPathSegment = url.pathname.split('/').at(-1) ?? '';
  const looksLikeStaticAsset = lastPathSegment.includes('.');

  return Boolean(seed) && !looksLikeStaticAsset;
}

export async function createAvatarWorkerResponse({
  request,
  assetsFetch,
  generateAvatarFor,
}: CreateAvatarWorkerResponseOptions): Promise<Response> {
  if (!isDirectAvatarAssetRequest(request)) {
    return assetsFetch(request);
  }

  try {
    const url = new URL(request.url);
    const seed = url.searchParams.get('t')?.trim() || DEFAULT_SEED;
    const avatar = await generateAvatarFor(seed);
    const svg = decodeSvgDataUriToUtf8(avatar.svgBase64);

    return new Response(svg, {
      headers: {
        'content-type': 'image/svg+xml; charset=utf-8',
        'cache-control': 'public, max-age=86400',
        'access-control-allow-origin': '*',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Avatar worker failed:', message);

    return new Response('Unexpected avatar payload', {
      status: 500,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'access-control-allow-origin': '*',
      },
    });
  }
}
