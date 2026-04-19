import { Buffer } from 'buffer';

import { renderAvatarPage } from './avatar.ts';

if (!('Buffer' in globalThis)) {
  Object.assign(globalThis, { Buffer });
}

const avatarMount = document.getElementById('avatar');
const seedLabel = document.getElementById('seed-value');
const randomButton = document.getElementById('random-button');

if (!(avatarMount instanceof HTMLElement)) {
  throw new Error('Missing #avatar element');
}

if (!(seedLabel instanceof HTMLElement)) {
  throw new Error('Missing #seed-value element');
}

if (!(randomButton instanceof HTMLButtonElement)) {
  throw new Error('Missing #random-button element');
}

renderAvatarPage({
  mountNode: avatarMount,
  seedLabel,
  randomButton,
}).catch((error: unknown) => {
  console.error('Failed to render avatar page', error);
  avatarMount.textContent = 'Avatar generation failed.';
});
