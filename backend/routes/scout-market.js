// routes/scout-market.js
import express from 'express';
import db from '../db.js';
import calcularRadar from '../services/radarCalculator.js';
import radarConfig from '../services/radarMetrics.js';
import { buildRawCache, buildRadarCache } from '../services/rawCache.js';
import { getLeague as getLeagueFromMap } from '../utils/leagueMap.js';

const router = express.Router();

// Índice das dimensões no array de radar (ordem do radarConfig.labels)
const DIM_INDEX = {
  finalizacao: 0,
  criacao:     1,
  passe:       2,
  progressao:  3,
  duelo:       4,
  defesa:      5,
};

router.get('/', (req, res) => {
  const {
    leagues,
    position,
    ageMin,
    ageMax,
    maxMarket,
    finalizacao,
    criacao,
    passe,
    progressao,
    duelo,
    defesa
  } = req.query;

  const leagueFilter = leagues ? leagues.split(',').map(l => l.trim()) : [];
  const posFilter    = position || null;
  const minAge       = ageMin ? Number(ageMin) : 0;
  const maxAge       = ageMax ? Number(ageMax) : 999;
  const maxMkt       = maxMarket ? Number(maxMarket) : Infinity;

  const percentilMin = {
    finalizacao: Number(finalizacao || 0),
    criacao:     Number(criacao     || 0),
    passe:       Number(passe       || 0),
    progressao:  Number(progressao  || 0),
    duelo:       Number(duelo       || 0),
    defesa:      Number(defesa      || 0),
  };

  db.all(`SELECT * FROM scouts WHERE posicao != 'G'`, [], (err, base) => {
    if (err) return res.status(500).json(err);

    buildRawCache(base);
    buildRadarCache(base);

    const candidates = base
      .filter(p => {
        if (Number(p.minutesPlayed) < 500) return false;

        if (posFilter && p.posicao !== posFilter) return false;

        if (
          leagueFilter.length > 0 &&
          !leagueFilter.includes(getLeagueFromMap(p.time))
        ) return false;

        const age = Number(p.idade) || 0;
        if (age > 0 && (age < minAge || age > maxAge)) return false;

        if (maxMkt !== Infinity && (p.valor_mercado || 0) > maxMkt) return false;

        return true;
      })
      .map(p => {
        const radarValues = calcularRadar(p, base, radarConfig.metrics);
        return { player: p, radarValues };
      })
      .filter(({ radarValues }) => {
        return Object.entries(percentilMin).every(([dim, min]) => {
          if (min === 0) return true;
          return radarValues[DIM_INDEX[dim]] >= min;
        });
      });

    const top5 = candidates
      .sort((a, b) => {
        const avgA = a.radarValues.reduce((s, v) => s + v, 0) / a.radarValues.length;
        const avgB = b.radarValues.reduce((s, v) => s + v, 0) / b.radarValues.length;
        return avgB - avgA;
      })
      .slice(0, 5)
      .map(({ player: p, radarValues }) => ({
        player_id:     p.player_id,
        nome:          p.nome,
        time:          p.time,
        posicao:       p.posicao,
        idade:         p.idade,
        url_foto:      p.url_foto,
        minutesPlayed: p.minutesPlayed,
        valor_mercado: p.valor_mercado,
        radarValues,
      }));

    res.json({ results: top5 });
  });
});

export default router;