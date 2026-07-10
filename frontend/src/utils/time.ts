export function formatMs(ms: number): string {
  const seconds = ms / 1000;
  return `${seconds.toFixed(1)}ש׳`;
}
