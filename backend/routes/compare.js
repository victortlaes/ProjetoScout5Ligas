import db from '../db.js';
import radarConfig from '../services/radarMetrics.js';
import calcularRadar from '../services/radarCalculator.js';
import { DEFAULT_SEASON, filterScoutsBySeason, findPlayerInSeason } from '../services/season.js';
import express from 'express';
const router = express.Router();

  


router.get('/', (req, res) => {
  const { a, b, season } = req.query;
console.log('🔥 /compare FOI CHAMADO', req.query);
  if (!a || !b) {
    return res.status(400).json({ error: 'IDs obrigatórios' });
  }

  db.all(
    `SELECT * FROM scouts WHERE posicao != 'G'`,
    [],
    (err, all) => {
      if (err) return res.status(500).json(err);

      const base = filterScoutsBySeason(all, season || DEFAULT_SEASON);
      const pA = findPlayerInSeason(base, a, season || DEFAULT_SEASON);
      const pB = findPlayerInSeason(base, b, season || DEFAULT_SEASON);

      if (!pA || !pB) {
        return res.status(404).json({ error: 'Jogador não foi encontrado ou é goleiro.' });
      }

      res.json({
        labels: radarConfig.labels,
        players: [
          {
            ...pA,
            values: calcularRadar(pA, base, radarConfig.metrics)
          },
          {
            ...pB,
            values: calcularRadar(pB, base, radarConfig.metrics)
          }
        ]
      });
    }
  );
});

export default router;
