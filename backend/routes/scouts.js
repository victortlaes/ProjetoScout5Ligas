import db from '../db.js';
import express from 'express';
const router = express.Router();

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
