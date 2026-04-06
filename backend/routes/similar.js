// routes/similar.js
import express from 'express';
import db from '../db.js';
import { findSimilarPlayers } from '../services/playerSimilarity.js';
import { buildRawCache, buildRadarCache, getRadar } from '../services/rawCache.js';
import { getLeague } from '../utils/leagueMap.js';

const router = express.Router();

router.get('/', (req, res) => {
  const { a, leagues, position, ageMin, ageMax } = req.query;

  if (!a) {
    return res.status(400).json({ error: 'ID do jogador é obrigatório' });
  }

  // Parse dos filtros
  const leagueFilter  = leagues ? leagues.split(',').map(l => l.trim()) : [];
  const posFilter     = position || null;
  const minAge        = ageMin ? Number(ageMin) : 0;
  const maxAge        = ageMax ? Number(ageMax) : 999;

  db.all(
    `SELECT * FROM scouts WHERE posicao != 'G'`,
    [],
    (err, base) => {
      if (err) return res.status(500).json(err);

      // Garante caches atualizados antes de calcular similaridade
      buildRawCache(base);
      buildRadarCache(base);

      // O jogador alvo é buscado no universo completo (sem filtro)
      const player = base.find(p => p.player_id == a);
      if (!player) {
        return res.status(404).json({ error: 'Jogador não encontrado' });
      }

      // Universo para comparação: aplica filtros
      const universo = base.filter(p => {
        if (p.player_id == a) return false; // exclui o próprio jogador

        if (posFilter && p.posicao !== posFilter) return false;

        if (leagueFilter.length > 0) {
          const liga = getLeague(p.time);
          if (!leagueFilter.includes(liga)) return false;
        }

        const age = Number(p.idade) || 0;
        if (age > 0 && (age < minAge || age > maxAge)) return false;

        return true;
      });

      if (universo.length === 0) {
        return res.json({ base: { player_id: player.player_id, nome: player.nome }, similares: [] });
      }

      const similares = findSimilarPlayers(player, universo, 5);

      // Calcula radar do jogador base para comparação no frontend
      const baseRadar = getRadar(player.player_id);

      res.json({
        base: { player_id: player.player_id, nome: player.nome },
        baseRadar: baseRadar || [],
        similares
      });
    }
  );
});

export default router;