import assert from 'node:assert/strict';
import test from 'node:test';

import { runAvatarGenerationCycle } from '../src/components/avatar-generation.ts';

test('runAvatarGenerationCycle generates immediately without artificial delay steps', async () => {
  const events: string[] = [];

  await runAvatarGenerationCycle({
    nextSeed: 'seed-123',
    createRandomSeed: () => {
      events.push('create-seed');
      return 'random-seed';
    },
    generateAvatarDataUri: async (seed: string) => {
      events.push(`generate:${seed}`);
      return `data:${seed}`;
    },
    onStart: () => {
      events.push('start');
    },
    onAvatarReady: (avatar, seed) => {
      events.push(`ready:${seed}:${avatar}`);
    },
    onFinish: () => {
      events.push('finish');
    },
  });

  assert.deepEqual(events, [
    'start',
    'generate:seed-123',
    'ready:seed-123:data:seed-123',
    'finish',
  ]);
});

test('runAvatarGenerationCycle uses a random seed only when one is not provided', async () => {
  const events: string[] = [];

  await runAvatarGenerationCycle({
    createRandomSeed: () => {
      events.push('create-seed');
      return 'random-seed';
    },
    generateAvatarDataUri: async (seed: string) => {
      events.push(`generate:${seed}`);
      return `data:${seed}`;
    },
    onAvatarReady: (_avatar, seed) => {
      events.push(`ready:${seed}`);
    },
  });

  assert.deepEqual(events, [
    'create-seed',
    'generate:random-seed',
    'ready:random-seed',
  ]);
});
