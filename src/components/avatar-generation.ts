export interface RunAvatarGenerationCycleOptions {
  nextSeed?: string;
  createRandomSeed: () => string;
  generateAvatarDataUri: (seed: string) => Promise<string>;
  onStart?: () => void;
  onAvatarReady: (avatar: string, seed: string) => void;
  onFinish?: () => void;
}

export async function runAvatarGenerationCycle({
  nextSeed,
  createRandomSeed,
  generateAvatarDataUri,
  onStart,
  onAvatarReady,
  onFinish,
}: RunAvatarGenerationCycleOptions): Promise<void> {
  onStart?.();
  const resolvedSeed = nextSeed ?? createRandomSeed();
  const avatar = await generateAvatarDataUri(resolvedSeed);
  onAvatarReady(avatar, resolvedSeed);
  onFinish?.();
}
