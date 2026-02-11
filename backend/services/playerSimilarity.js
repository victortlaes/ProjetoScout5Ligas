import { euclideanDistance } from './similarity.js';
import { getRadar } from './rawCache.js';

export function findSimilarPlayers(targetPlayer, universo, topN = 5) {
  const targetVector = getRadar(targetPlayer.player_id);

  const similares = universo
    .filter(p => p.player_id !== targetPlayer.player_id)
    .map(p => {
      const vector = getRadar(p.player_id);

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
    .sort((a, b) => b.similaridade - a.similaridade)
    .slice(0, topN);

  return similares;
}
