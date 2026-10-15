export function normalizeSeason(raw, fallback = '2025') {
  const s = String(raw ?? '').trim();
  return s || fallback;
}

/** Uma linha por player_id dentro da temporada selecionada. */
export function playersForSeason(allRows, season) {
  const s = normalizeSeason(season);
  const byId = new Map();
  for (const p of allRows) {
    if (normalizeSeason(p.temporada) !== s) continue;
    byId.set(String(p.player_id), p);
  }
  return [...byId.values()];
}
