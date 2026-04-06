import { euclideanDistance } from './similarity.js';
import { getRadar } from './rawCache.js';

function getMinutes(player) {
  return Number(
    player.minutesPlayed ??
    player.minutes_played ??
    player.minutes ??
    0
  );
}

export function findSimilarPlayers(targetPlayer, universo, topN = 5) {
  const targetVector = getRadar(targetPlayer.player_id);
  if (!Array.isArray(targetVector) || targetVector.length === 0) return [];

  const similares = universo
    .filter(p =>
      p.player_id !== targetPlayer.player_id &&
      getMinutes(p) >= 500
    )
    .map(p => {
      const vector = getRadar(p.player_id);
      if (!Array.isArray(vector) || vector.length !== targetVector.length) return null;

      const distancia = euclideanDistance(targetVector, vector);

      // normalização simples para %
      const similaridade = Math.max(
        0,
        Math.round((1 - distancia / 300) * 100)
      );

      return {
        player_id: p.player_id,
        nome: p.nome,
        time: p.time,
        posicao: p.posicao,
        url_foto: p.url_foto,
        similaridade,
        distancia,
        radar: vector
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.similaridade - a.similaridade)
    .slice(0, topN);

  return similares;
}
