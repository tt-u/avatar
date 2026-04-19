import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createRandomSeed,
  generateAvatarDataUri,
  getSeedFromSearch,
} from '../src/avatar.ts';

test('getSeedFromSearch returns the provided t query parameter', () => {
  assert.equal(getSeedFromSearch('?t=1000000', 'fallback-seed'), '1000000');
});

test('getSeedFromSearch falls back when t is missing', () => {
  assert.equal(getSeedFromSearch('', 'fallback-seed'), 'fallback-seed');
});

test('createRandomSeed combines time and randomness into a deterministic string for injected inputs', () => {
  assert.equal(createRandomSeed(1713548400000, 0.123456789), '1713548400000-123456789');
});

test('generateAvatarDataUri returns an SVG data URI', async () => {
  const dataUri = await generateAvatarDataUri('1000000');

  assert.match(dataUri, /^data:image\/svg\+xml;base64,/);
});
