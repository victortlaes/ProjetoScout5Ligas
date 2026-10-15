import db from '../db.js';
import express from 'express';
import { DEFAULT_SEASON } from '../services/season.js';
const router = express.Router();

/**
 * GET /scouts/seasons
 * Temporadas disponíveis (mais recente primeiro)
 */
router.get('/seasons', (req, res) => {
  db.all(
    `SELECT DISTINCT temporada FROM scouts
     WHERE temporada IS NOT NULL AND trim(temporada) != ''
     ORDER BY temporada DESC`,
    [],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao listar temporadas' });
      }
      const seasons = rows.map(r => String(r.temporada));
      res.json(seasons.length ? seasons : [DEFAULT_SEASON]);
    }
  );
});

/**
 * GET /scouts
 * Retorna todos os jogadores da tabela scouts
 */
router.get('/', (req, res) => {
  db.all(
    `SELECT * FROM scouts`,
    [],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao buscar scouts' });
      }

      res.json(rows);
    }
  );
});

export default router;
