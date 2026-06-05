export function getPlayerPhotoUrl(playerId) {
  if (!playerId) return null;
  return `/images/${playerId}.png`;
}
