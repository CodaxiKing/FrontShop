export const formatDuration = (durationMs: number) => {
  const seconds = Math.floor((durationMs / 1000) % 60);
  const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
  const hours = Math.floor(durationMs / (1000 * 60 * 60));

  const pad = (num: number) => String(num).padStart(2, "0");

  return `${pad(hours)}h ${pad(minutes)}min ${pad(seconds)}s`;
};
