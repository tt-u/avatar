import { renderAvatarPage } from './avatar.js';

const app = document.getElementById('app');

if (!app) {
  throw new Error('Missing #app element');
}

renderAvatarPage({ mountNode: app }).catch((error) => {
  console.error('Failed to render avatar page', error);
  app.textContent = 'Avatar generation failed.';
});
