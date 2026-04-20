import { generateAvatarFor } from '@bitmappunks/avatar-generator';

import { createAvatarWorkerResponse } from './avatar-worker';

interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return createAvatarWorkerResponse({
      request,
      assetsFetch: (assetRequest) => env.ASSETS.fetch(assetRequest),
      generateAvatarFor,
    });
  },
} satisfies ExportedHandler<Env>;
