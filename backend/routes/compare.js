import db from '../db.js';
import radarConfig from '../services/radarMetrics.js';
import calcularRadar from '../services/radarCalculator.js';
import express from 'express';
const router = express.Router();

  


router.get('/', (req, res) => {
  const { a, b } = req.query;
console.log('🔥 /compare FOI CHAMADO', req.query);
  if (!a || !b) {
    return res.status(400).json({ error: 'IDs obrigatórios' });
  }

  db.all(
    `SELECT * FROM scouts WHERE posicao != 'G'`,
    [],
    (err, base) => {
      if (err) return res.status(500).json(err);

      const pA = base.find(p => p.player_id == a);
      const pB = base.find(p => p.player_id == b);

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
