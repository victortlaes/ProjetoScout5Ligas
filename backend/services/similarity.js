
export function euclideanDistance(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return Infinity;
  if (a.length === 0 || b.length === 0) return Infinity;

  let sum = 0;

  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const av = Number(a[i]);
    const bv = Number(b[i]);
    const diff = (Number.isFinite(av) ? av : 0) - (Number.isFinite(bv) ? bv : 0);
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}