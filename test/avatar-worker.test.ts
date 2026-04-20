import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createAvatarWorkerResponse,
  decodeSvgDataUriToUtf8,
  isDirectAvatarAssetRequest,
} from '../worker/avatar-worker.ts';

test('decodeSvgDataUriToUtf8 decodes a base64 SVG data URI into raw svg text', () => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
  const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;

  assert.equal(decodeSvgDataUriToUtf8(dataUri), svg);
});

test('isDirectAvatarAssetRequest matches /avatar with a non-empty t query', () => {
  assert.equal(isDirectAvatarAssetRequest(new Request('https://example.com/avatar?t=ttu')), true);
  assert.equal(isDirectAvatarAssetRequest(new Request('https://example.com/avatar/?t=ttu')), true);
  assert.equal(isDirectAvatarAssetRequest(new Request('https://example.com/avatar/')), false);
  assert.equal(isDirectAvatarAssetRequest(new Request('https://example.com/avatar/assets/app.js?t=ttu')), false);
});

test('createAvatarWorkerResponse returns SVG bytes and image content type for a t seed', async () => {
  const response = await createAvatarWorkerResponse({
    request: new Request('https://example.com/avatar/?t=ttu'),
    assetsFetch: async () => new Response('asset fallback', { status: 299 }),
    generateAvatarFor: async (seed: string) => {
      assert.equal(seed, 'ttu');
      return {
        svgBase64: `data:image/svg+xml;base64,${Buffer.from('<svg id="ttu"/>', 'utf8').toString('base64')}`,
      };
    },
  });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'image/svg+xml; charset=utf-8');
  assert.equal(response.headers.get('access-control-allow-origin'), '*');
  assert.equal(await response.text(), '<svg id="ttu"/>');
});

test('createAvatarWorkerResponse delegates non-direct requests to static assets', async () => {
  const response = await createAvatarWorkerResponse({
    request: new Request('https://example.com/avatar/'),
    assetsFetch: async () => new Response('asset fallback', { status: 299 }),
    generateAvatarFor: async () => {
      throw new Error('generator should not run for non-direct requests');
    },
  });

  assert.equal(response.status, 299);
  assert.equal(await response.text(), 'asset fallback');
});

test('createAvatarWorkerResponse returns 500 when the generator payload is not an SVG data URI', async () => {
  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    const response = await createAvatarWorkerResponse({
      request: new Request('https://example.com/avatar/?t=broken'),
      assetsFetch: async () => new Response('asset fallback', { status: 299 }),
      generateAvatarFor: async () => ({ svgBase64: 'not-a-data-uri' }),
    });

    assert.equal(response.status, 500);
    assert.match(await response.text(), /unexpected avatar payload/i);
  } finally {
    console.error = originalConsoleError;
  }
});
