const WARN_INVALID = import.meta.env?.DEV ?? false;

export function normalizeScores(values: number[]): number[] {
  const valid = values.map((v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) {
      if (WARN_INVALID) console.warn("[normalizeScores] Invalid value:", v);
      return null;
    }
    return n;
  });

  const finite = valid.filter((v): v is number => v !== null);
  if (finite.length === 0) return values.map(() => 0);

  const min = Math.min(...finite);
  const max = Math.max(...finite);

  if (max === min) return values.map(() => (valid.some((v) => v === null) ? 0 : 50));

  return values.map((v, i) => {
    const n = valid[i];
    if (n === null) return 0;
    const norm = ((n - min) / (max - min)) * 100;
    return Math.max(0, Math.min(100, norm));
  });
}
