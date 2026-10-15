export const DEFAULT_SEASON = '2025';

export function normalizeSeason(raw) {
  const s = String(raw ?? '').trim();
  return s || DEFAULT_SEASON;
}

export function filterScoutsBySeason(rows, season) {
  const s = normalizeSeason(season);
  return rows.filter(p => normalizeSeason(p.temporada) === s);
}

export function findPlayerInSeason(rows, playerId, season) {
  return rows.find(
    p => p.player_id == playerId && normalizeSeason(p.temporada) === normalizeSeason(season)
  );
}
