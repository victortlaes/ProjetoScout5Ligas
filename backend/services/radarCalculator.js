import calcularPercentil from './percentil.js';

import {
  getCreationRaw,
  getShootingRaw,
  getDefenseRaw,
  getDuelRaw,
  getPassRaw,
  getProgressionRaw,
  getCreationUniverso,
  getShootingUniverso,
  getDefenseUniverso,
  getDuelUniverso,
  getPassUniverso,
  getProgressionUniverso
} from '../services/scoring.js';

// ==============================
// Fallback genérico
// ==============================
function media(player, keys) {
  const vals = keys.map(k => Number(player[k]) || 0);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

// ==============================
// Filtros de universo
// ==============================

function filtrarUniversoCriacao(universo) {
  return universo.filter(p =>
    Number(p.minutesPlayed ?? p.minutes ?? 0) >= 500 &&
    ['M', 'F'].includes(p.posicao)
  );
}

function filtrarUniversoFinalizacao(universo) {
  return universo.filter(p =>
    Number(p.minutesPlayed ?? p.minutes ?? 0) >= 500 &&
    ['F'].includes(p.posicao)
  );
}

function filtrarUniversoDefesa(universo) {
  return universo.filter(p =>
    Number(p.minutesPlayed ?? p.minutes ?? 0) >= 500 &&
    ['D', 'M'].includes(p.posicao)
  );
}

function filtrarUniversoDuelo(universo) {
  return universo.filter(p =>
    Number(p.minutesPlayed ?? p.minutes ?? 0) >= 500 &&
    ['D', 'M', 'F'].includes(p.posicao)
  );
}

function filtrarUniversoPasse(universo) {
  return universo.filter(p =>
    Number(p.minutesPlayed ?? p.minutes ?? 0) >= 500 &&
    ['D', 'M', 'F'].includes(p.posicao)
  );
}

function filtrarUniversoProgressao(universo, player) {
  return universo.filter(p =>
    Number(p.minutesPlayed ?? p.minutes ?? 0) >= 500 &&
    ['D', 'M', 'F'].includes(p.posicao)

  );
}

// ==============================
// Radar principal
// ==============================

export default function calcularRadar(player, universo, metrics) {

  const universoCriacao = filtrarUniversoCriacao(universo);
  const universoFinalizacao = filtrarUniversoFinalizacao(universo);
  const universoDefesa = filtrarUniversoDefesa(universo);
  const universoDuelo = filtrarUniversoDuelo(universo);
  const universoPasse = filtrarUniversoPasse(universo);
  const universoProgressao = filtrarUniversoProgressao(universo, player);

  // ===== RAW do player =====
  const creationRawPlayer = getCreationRaw(player.player_id);
  const shootingRawPlayer = getShootingRaw(player.player_id);
  const defenseRawPlayer = getDefenseRaw(player.player_id);
  const duelRawPlayer = getDuelRaw(player.player_id);
  const passRawPlayer = getPassRaw(player.player_id);
  const progressionRawPlayer = getProgressionRaw(player.player_id);

  // ===== RAW do universo =====
  const creationRawUniverso = getCreationUniverso(
    universoCriacao.map(p => p.player_id)
  );

  const shootingRawUniverso = getShootingUniverso(
    universoFinalizacao.map(p => p.player_id)
  );

  const defenseRawUniverso = getDefenseUniverso(
    universoDefesa.map(p => p.player_id)
  );

  const duelRawUniverso = getDuelUniverso(
    universoDuelo.map(p => p.player_id)
  );

  const passRawUniverso = getPassUniverso(
    universoPasse.map(p => p.player_id)
  );

  const progressionRawUniverso = getProgressionUniverso(
    universoProgressao.map(p => p.player_id)
  );

  return Object.entries(metrics).map(([label, keys]) => {

    if (label === 'criacao') {
      return calcularPercentil(creationRawPlayer, creationRawUniverso);
    }

    if (label === 'finalizacao') {
      return calcularPercentil(shootingRawPlayer, shootingRawUniverso);
    }

    if (label === 'defesa') {
      return calcularPercentil(defenseRawPlayer, defenseRawUniverso);
    }

    if (label === 'duelo') {
      return calcularPercentil(duelRawPlayer, duelRawUniverso);
    }

    if (label === 'passe') {
      return calcularPercentil(passRawPlayer, passRawUniverso);
    }

    if (label === 'progressao') {
      return calcularPercentil(progressionRawPlayer, progressionRawUniverso);
    }

    const valoresUniverso = universo.map(p => media(p, keys));
    const valorPlayer = media(player, keys);

    return calcularPercentil(valorPlayer, valoresUniverso);
  });
}
