import {
  buildCreationRaw,
  buildShootingRaw,
  buildDefenseRaw,
  buildDuelRaw, 
  buildPassRaw
} from './scoring.js';

import calcularRadar from './radarCalculator.js';
import radarConfig from './radarMetrics.js';

const radarCache = new Map();
/*
  ⚡ RAW CACHE
  - NÃO calcula raw aqui
  - Apenas chama os builders do scoring
  - E expõe getters
*/


//RADAR CACHE//
export function buildRadarCache(universo) {
  radarCache.clear();

  universo.forEach(player => {
    const radar = calcularRadar(
      player,
      universo,
      radarConfig.metrics
    );

    radarCache.set(player.player_id, radar);
  });

  console.log('⚡ Radar cache construído:', radarCache.size);
}

export function getRadar(playerId) {
  return radarCache.get(playerId);
}

//RAW CACHE//

export function buildRawCache(universo) {
  console.log('⚡ Construindo RAW cache...');

  for (const player of universo) {
    buildCreationRaw(player);
    buildShootingRaw(player);
    buildDefenseRaw(player);
    buildDuelRaw(player);
    buildPassRaw(player);


  }

  console.log('✅ RAW cache pronto:', {
    jogadores: universo.length
  });
}
