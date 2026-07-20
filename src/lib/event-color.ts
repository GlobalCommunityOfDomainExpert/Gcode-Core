export function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getEventColor(seed: string): string {
  const hue = hashSeed(seed) % 360;
  return `hsl(${hue} 55% 42%)`;
}
