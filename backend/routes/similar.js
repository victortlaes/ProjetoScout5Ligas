// routes/similar.js
import express from 'express';
import db from '../db.js';
import { findSimilarPlayers } from '../services/playerSimilarity.js';

const router = express.Router();

router.get('/', (req, res) => {
  const { a } = req.query;

  if (!a) {
    return res.status(400).json({ error: 'ID do jogador é obrigatório' });
  }

  db.all(
    `SELECT * FROM scouts WHERE posicao != 'G'`,
    [],
    (err, base) => {
      if (err) return res.status(500).json(err);

      const player = base.find(p => p.player_id == a);

      if (!player) {
        return res.status(404).json({ error: 'Jogador não encontrado' });
      }

      const similares = findSimilarPlayers(player, base, 5);

      res.json({
        base: {
          player_id: player.player_id,
          nome: player.nome
        },
        similares
      });
    }
  );
});

export default router;
