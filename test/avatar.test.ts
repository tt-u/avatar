import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createRandomSeed,
  generateAvatarDataUri,
  getSeedFromSearch,
  isDirectAvatarRequest,
} from '../src/avatar.ts';

test('getSeedFromSearch returns the provided t query parameter', () => {
  assert.equal(getSeedFromSearch('?t=1000000', 'fallback-seed'), '1000000');
});

test('getSeedFromSearch falls back when t is missing', () => {
  assert.equal(getSeedFromSearch('', 'fallback-seed'), 'fallback-seed');
});

test('isDirectAvatarRequest is true when a non-empty t query parameter is present', () => {
  assert.equal(isDirectAvatarRequest('?t=1000000'), true);
  assert.equal(isDirectAvatarRequest('?foo=1&t=seed-value'), true);
});

test('isDirectAvatarRequest is false when t is missing or blank', () => {
  assert.equal(isDirectAvatarRequest(''), false);
  assert.equal(isDirectAvatarRequest('?t='), false);
  assert.equal(isDirectAvatarRequest('?foo=1'), false);
});

test('createRandomSeed combines time and randomness into a deterministic string for injected inputs', () => {
  assert.equal(createRandomSeed(1713548400000, 0.123456789), '1713548400000-123456789');
});

test('generateAvatarDataUri returns an SVG data URI', async () => {
  const dataUri = await generateAvatarDataUri('1000000');

  assert.match(dataUri, /^data:image\/svg\+xml;base64,/);
});
