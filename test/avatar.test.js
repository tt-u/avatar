import test from 'node:test';
import assert from 'node:assert/strict';

import { generateAvatarDataUri, getSeedFromSearch } from '../src/avatar.js';

test('getSeedFromSearch returns the provided t query parameter', () => {
  assert.equal(getSeedFromSearch('?t=1000000', 'fallback-seed'), '1000000');
});

test('getSeedFromSearch falls back when t is missing', () => {
  assert.equal(getSeedFromSearch('', 'fallback-seed'), 'fallback-seed');
});

test('generateAvatarDataUri returns an SVG data URI', async () => {
  const dataUri = await generateAvatarDataUri('1000000');

  assert.match(dataUri, /^data:image\/svg\+xml;base64,/);
});
