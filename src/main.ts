import { Buffer } from 'buffer';

import {
  isDirectAvatarRequest,
  renderAvatarPage,
  renderDirectAvatarPage,
} from './avatar.ts';

if (!('Buffer' in globalThis)) {
  Object.assign(globalThis, { Buffer });
}

async function bootstrap(): Promise<void> {
  if (isDirectAvatarRequest(window.location.search)) {
    await renderDirectAvatarPage();
    return;
  }

  const avatarMount = document.getElementById('avatar');
  const seedLabel = document.getElementById('seed-value');
  const randomButton = document.getElementById('random-button');
  const avatarCard = document.getElementById('avatar-card');
  const burstContainer = document.getElementById('button-burst');

  if (!(avatarMount instanceof HTMLElement)) {
    throw new Error('Missing #avatar element');
  }

  if (!(seedLabel instanceof HTMLElement)) {
    throw new Error('Missing #seed-value element');
  }

  if (!(randomButton instanceof HTMLButtonElement)) {
    throw new Error('Missing #random-button element');
  }

  if (!(avatarCard instanceof HTMLElement)) {
    throw new Error('Missing #avatar-card element');
  }

  if (!(burstContainer instanceof HTMLElement)) {
    throw new Error('Missing #button-burst element');
  }

  await renderAvatarPage({
    mountNode: avatarMount,
    seedLabel,
    randomButton,
    avatarCard,
    burstContainer,
  });
}

bootstrap().catch((error: unknown) => {
  console.error('Failed to render avatar page', error);

  const avatarMount = document.getElementById('avatar');
  if (avatarMount instanceof HTMLElement) {
    avatarMount.textContent = 'Avatar generation failed.';
  }
});
