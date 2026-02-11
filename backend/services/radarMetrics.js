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
      'totalShots',
      'onTargetScoringAttempt'
    ],

    criacao: [
      'goalAssist',
      'expectedAssists',
      
      'bigChanceCreated'
    ],

    passe: [
      'accuratePass',
      'totalPass',
      'accurateLongBalls', 
      'keyPass',
    ],

    progressao: [
      'progressiveBallCarriesCount',
      'progressivePassesCount'
    ],

    duelo: [
      'duelWon',
      'aerialWon'
    ],

    defesa: [
      'interceptionWon',
      'ballRecovery',
      'totalTackle'
    ]
  }
};

export default radarConfig;
