import calcularPercentil from './percentil.js';

const creationRawCache = new Map();
const shootingRawCache = new Map();
const defenseRawCache = new Map();
const duelRawCache = new Map();
const passRawCache = new Map();


/* ========= HELPERS ========= */

function per90(value, minutes) {
  if (!minutes || minutes < 50) return 0;
  return (Number(value) / minutes) * 90;
}

function getMinutes(player) {
  return Number(
    player.minutesPlayed ??
    player.minutes_played ??
    player.minutes ??
    0
  );
}

/* ========= CRIAÇÃO ========= */

export function buildCreationRaw(player) {
  const minutes = getMinutes(player);

  const raw =
    per90(player.expectedAssists, minutes) * 0.1 +
    per90(player.bigChanceCreated, minutes) * 0.4 +
    per90(player.goalAssist, minutes) * 0.5;

  creationRawCache.set(player.player_id, raw);
}

export function getCreationRaw(playerId) {
  return creationRawCache.get(playerId) ?? 0;
}

export function getCreationUniverso(ids) {
  return ids.map(id => getCreationRaw(id));
}

/* ========= FINALIZAÇÃO ========= */

export function buildShootingRaw(player) {
  const minutes = getMinutes(player);
  if (minutes < 50) {
    shootingRawCache.set(player.player_id, 0);
    return;
  }

  const goals90 = per90(player.goals, minutes);
  const xg90 = per90(player.expectedGoals, minutes);
  const bcm90 = per90(player.bigChanceMissed, minutes);

  const totalShots = Number(player.totalShots) || 0;
  const onTarget = Number(player.onTargetScoringAttempt) || 0;
  const onTargetPct = totalShots > 0 ? onTarget / totalShots : 0;

  const raw =
    goals90 * 0.5 +
    xg90 * 0.2 +
    onTargetPct * 0.3 -
    bcm90 * 0.2;

  shootingRawCache.set(player.player_id, raw);
}

export function getShootingRaw(playerId) {
  return shootingRawCache.get(playerId) ?? 0;
}

export function getShootingUniverso(ids) {
  return ids.map(id => getShootingRaw(id));
}

/* ========= DEFESA ========= */


export function buildDefenseRaw(player) {
  const minutes = getMinutes(player);

  if (minutes < 100) {
    defenseRawCache.set(player.player_id, 0);
    return;
  }

 const tackleSuccess =
    player.totalTackle && player.totalTackle > 5
      ? player.wonTackle / player.totalTackle
      : 0;

  const wonTackleX = player.wonTackle > 5
    ? player.wonTackle 
    : 0;



  const raw =
  (
    per90(wonTackleX, minutes) * 0.15 +
    per90(player.interceptionWon, minutes) * 0.25 +
    per90(player.totalClearance, minutes) * 0.25 +
    per90(player.ballRecovery, minutes) * 0.15 +
    tackleSuccess * 0.15 -
    per90(player.challengeLost, minutes) * 0.2
    //-per90(player.errorLeadToAShot, minutes) * 1
  );

  
    if(player.nome === "Robert Arboleda" || player.nome === "Ayrton Lucas" || player.nome === "Léo Pereira" || player.nome === "Léo Ortiz"){ 
      console.log('Defesa RAW', player.nome, raw);
      console.log("Won Tackle: ",wonTackleX, per90(wonTackleX, minutes) * 0.2, "Interceptions: ", player.interceptionWon, per90(player.interceptionWon, minutes) * 0.2, "Clearances: ", player.totalClearance, per90(player.totalClearance, minutes) * 0.1, "Tackle Success: ", tackleSuccess, "Ball Recovery: ", player.ballRecovery, per90(player.ballRecovery, minutes) * 0.3, "Challenge Lost: ", player.challengeLost, per90(player.challengeLost, minutes) * 0.3);
    }
  defenseRawCache.set(player.player_id, raw);
}

export function getDefenseRaw(playerId) {
  return defenseRawCache.get(playerId) ?? 0;
}

export function getDefenseUniverso(ids) {
  return ids.map(id => getDefenseRaw(id));
}


/* ========= DUELOS ========= */


export function buildDuelRaw(player) {
  const minutes = getMinutes(player);

  if (minutes < 100) {
    duelRawCache.set(player.player_id, 0);
    return;
  }

  const totalDuels =
    (player.duelWon || 0) +
    (player.duelLost || 0);

  const aerialTotal =
    (player.aerialWon || 0) +
    (player.aerialLost || 0);

  const groundSuccess =
    totalDuels - aerialTotal > 5
      ? player.duelWon / totalDuels
      : 0;

  const aerialSuccess =
    aerialTotal > 3
      ? player.aerialWon / aerialTotal
      : 0;

  const raw =
    per90(player.duelWon, minutes) * 0.4 +      // volume geral
    groundSuccess * 0.2 +                   // eficiência no chão
    aerialSuccess * 0.2 +                   // eficiência aérea
    per90(player.aerialWon, minutes) * 0.4; // presença aérea real

  duelRawCache.set(player.player_id, raw);
}

export function getDuelRaw(playerId) {
  return duelRawCache.get(playerId) ?? 0;
}

export function getDuelUniverso(ids) {
  return ids.map(id => getDuelRaw(id));
}


/* ========= PASSES ========= */


export function buildPassRaw(player) {
  const minutes = getMinutes(player);

  if (minutes < 300) {
    passRawCache.set(player.player_id, 0);
    return;
  }

  const totalPass = player.totalPass || 0;
  const accuratePass = player.accuratePass || 0;
  const accurateLongBalls = player.accurateLongBalls || 0;
  const keyPass = player.keyPass || 0;

  const passAccuracy =
    totalPass > 20
      ? accuratePass / totalPass
      : 0;

  const raw =
    passAccuracy * 0.25 +       // eficiência
    per90(totalPass, minutes) * 0.01 +       // volume
    per90(accurateLongBalls, minutes) * 0.2 +       // qualidade longa
    per90(keyPass, minutes) * 0.5;      // impacto criativo

  passRawCache.set(player.player_id, raw);
}

export function getPassRaw(playerId) {
  return passRawCache.get(playerId) ?? 0;
}

export function getPassUniverso(ids) {
  return ids.map(id => getPassRaw(id));
}
