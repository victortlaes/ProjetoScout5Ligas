import calcularPercentil from './percentil.js';
import {
  getCreationRaw,
  getShootingRaw,
  getDefenseRaw,
  getCreationUniverso,
  getShootingUniverso,
  getDefenseUniverso
} from '../services/scoring.js';

// fallback
function media(player, keys) {
  const vals = keys.map(k => Number(player[k]) || 0);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function filtrarUniversoCriacao(universo) {
  return universo.filter(p =>
    Number(p.minutesPlayed ?? p.minutes ?? 0) >= 300 &&
    ['M', 'F'].includes(p.posicao)
  );
}

function filtrarUniversoFinalizacao(universo) {
  return universo.filter(p =>
    Number(p.minutesPlayed ?? p.minutes ?? 0) >= 300 &&
    ['F'].includes(p.posicao)
  );
}

function filtrarUniversoDefesa(universo) {
  return universo.filter(p =>
    Number(p.minutesPlayed ?? p.minutes ?? 0) >= 500 &&
  ['D', 'M'].includes(p.posicao)
    //p.posicao !== 'G' && p.posicao !== 'F'
  );
}


export default function calcularRadar(player, universo, metrics) {

  const universoCriacao = filtrarUniversoCriacao(universo);
  const universoFinalizacao = filtrarUniversoFinalizacao(universo);
  const universoDefesa = filtrarUniversoDefesa(universo);

  const creationRawPlayer = getCreationRaw(player.player_id);
  const shootingRawPlayer = getShootingRaw(player.player_id);
  const defenseRawPlayer = getDefenseRaw(player.player_id);

  const creationRawUniverso = getCreationUniverso(
    universoCriacao.map(p => p.player_id)
  );

  const shootingRawUniverso = getShootingUniverso(
    universoFinalizacao.map(p => p.player_id)
  );

  const defenseRawUniverso = getDefenseUniverso(
    universoDefesa.map(p => p.player_id)
  );

  return Object.entries(metrics).map(([label, keys]) => {

    if (label === 'criacao') {
      return calcularPercentil(
        creationRawPlayer,
        creationRawUniverso
      );
    }

    if (label === 'finalizacao') {
      return calcularPercentil(
        shootingRawPlayer,
        shootingRawUniverso
      );
    }

    if (label === 'defesa') {
      return calcularPercentil(
        defenseRawPlayer,
        defenseRawUniverso
      );
    }

    // fallback genérico
    const valoresUniverso = universo.map(p => media(p, keys));
    const valorPlayer = media(player, keys);

    return calcularPercentil(valorPlayer, valoresUniverso);
  });
}
