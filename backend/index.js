import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import compareRoutes from './routes/compare.js';
import scoutsRoutes from './routes/scouts.js';
import similarRoutes from './routes/similar.js';
import aiCompareRoutes from './routes/aiCompare.js';
import scoutMarketRoutes from './routes/scout-market.js';


import db from './db.js';
import { buildRawCache, buildRadarCache } from './services/rawCache.js';
import { DEFAULT_SEASON, filterScoutsBySeason } from './services/season.js';

const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());

app.use(cors({
  origin: '*'
}));


app.use('/scouts', scoutsRoutes);
app.use('/compare', compareRoutes);
app.use('/similar', similarRoutes);
app.use('/ai-compare', aiCompareRoutes);
app.use('/scout-market', scoutMarketRoutes);


db.all('SELECT * FROM scouts', [], (err, rows) => {
  if (err) throw err;

  db.all(
    `SELECT DISTINCT temporada FROM scouts
     WHERE temporada IS NOT NULL AND trim(temporada) != ''
     ORDER BY temporada DESC`,
    [],
    (err2, seasonRows) => {
      if (err2) throw err2;
      const latest = seasonRows[0]?.temporada || DEFAULT_SEASON;
      const universo = filterScoutsBySeason(rows, latest);
      global.UNIVERSO = universo;
      buildRawCache(universo);
      buildRadarCache(universo);
    }
  );
});


app.listen(PORT, () => {
  console.log(`🚀 rodando na porta ${PORT}`);
});