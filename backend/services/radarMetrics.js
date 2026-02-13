const radarConfig = {
  labels: [
    'Finalização',
    'Criação',
    'Passe',
    'Progressão',
    'Duelo',
    'Defesa'
  ],

  metrics: {

    finalizacao: [
      'goals',
      'expectedGoals',
      'bigChanceMissed',
      'totalShots',
      'onTargetScoringAttempt'
    ],

    criacao: [
      'goalAssist',
      'expectedAssists',
      'bigChanceCreated',
      'accurateCross',
      'totalCross'
    ],

    passe: [
      'accuratePass',
      'totalPass',
      'accurateLongBalls',
      'keyPass'
    ],

    progressao: [
      'ballCarriesCount',
      'accurateOppositionHalfPasses',
      'totalOppositionHalfPasses',
      'touches',
      'possessionLostCtrl'
    ],

    duelo: [
      'duelWon',
      'duelLost',
      'aerialWon',
      'aerialLost'
  ],

    defesa: [
      'wonTackle',
      'totalTackle',
      'interceptionWon',
      'totalClearance',
      'ballRecovery',
      'outfielderBlock',
      'challengeLost'
    ]
  }
};

export default radarConfig;
